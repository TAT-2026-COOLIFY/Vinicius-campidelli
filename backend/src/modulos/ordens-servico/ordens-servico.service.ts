import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { arredondarMoeda, dataDeHoje } from '../../comum/formatadores';
import {
  Cliente,
  FormaPagamento,
  ItemOrdem,
  MovimentacaoFinanceira,
  OrdemServico,
  StatusOrdem,
  TipoItemOrdem,
  TipoMovimentacao,
  Veiculo,
} from '../../modelos';
import { CaixaService } from '../caixa/caixa.service';
import { PecasService } from '../pecas/pecas.service';
import { ServicosService } from '../servicos/servicos.service';
import {
  AdicionarItemOrdemDto,
  AtualizarOrdemServicoDto,
  CriarOrdemServicoDto,
} from './ordem-servico.dto';

/** Item de ordem no formato exposto pela API (referenciaId unifica servicoId/pecaId). */
export interface ItemOrdemApi {
  id: number;
  tipo: TipoItemOrdem;
  referenciaId: number;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

/** Ordem de servico com cliente, veiculo e itens resolvidos para exibicao em tela. */
export interface OrdemServicoDetalhada {
  id: number;
  numero: string;
  clienteId: number;
  veiculoId: number;
  dataAbertura: string;
  dataConclusao: string | null;
  status: StatusOrdem;
  observacoes: string;
  itens: ItemOrdemApi[];
  valorTotal: number;
  nomeCliente: string;
  telefoneCliente: string;
  descricaoVeiculo: string;
  placaVeiculo: string;
  totalServicos: number;
  totalPecas: number;
}

@Injectable()
export class OrdensServicoService {
  constructor(
    @InjectRepository(OrdemServico) private readonly ordensRepositorio: Repository<OrdemServico>,
    @InjectRepository(ItemOrdem) private readonly itensRepositorio: Repository<ItemOrdem>,
    @InjectRepository(Cliente) private readonly clientesRepositorio: Repository<Cliente>,
    @InjectRepository(Veiculo) private readonly veiculosRepositorio: Repository<Veiculo>,
    @InjectRepository(MovimentacaoFinanceira)
    private readonly movimentacoesRepositorio: Repository<MovimentacaoFinanceira>,
    private readonly pecasService: PecasService,
    private readonly servicosService: ServicosService,
    private readonly caixaService: CaixaService,
  ) {}

  /** Lista as ordens de servico, com filtro opcional por status. */
  async listarOrdens(status?: StatusOrdem): Promise<OrdemServicoDetalhada[]> {
    const lista = await this.ordensRepositorio.find({
      where: status ? { status } : {},
      relations: { itens: true },
    });
    const detalhadas = await Promise.all(lista.map((ordem) => this.detalharOrdem(ordem)));
    return detalhadas.sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura));
  }

  /** Busca uma ordem de servico pelo identificador. */
  async buscarOrdemPorId(id: number): Promise<OrdemServicoDetalhada> {
    return this.detalharOrdem(await this.encontrar(id));
  }

  /** Abre uma nova ordem de servico para um cliente e veiculo. */
  async criarOrdem(dados: CriarOrdemServicoDto): Promise<OrdemServicoDetalhada> {
    const veiculo = await this.veiculosRepositorio.findOneBy({ id: dados.veiculoId });
    if (!veiculo) throw new NotFoundException('Veiculo nao encontrado.');
    if (veiculo.clienteId !== dados.clienteId) {
      throw new BadRequestException('O veiculo selecionado nao pertence a este cliente.');
    }

    const ordem = this.ordensRepositorio.create({
      numero: await this.gerarNumeroOrdem(),
      clienteId: dados.clienteId,
      veiculoId: dados.veiculoId,
      dataAbertura: dataDeHoje(),
      dataConclusao: null,
      status: StatusOrdem.ABERTA,
      observacoes: dados.observacoes ?? '',
      valorTotal: 0,
    });
    const salva = await this.ordensRepositorio.save(ordem);
    salva.itens = [];
    return this.detalharOrdem(salva);
  }

  /** Atualiza observacoes e status da ordem. */
  async atualizarOrdem(id: number, dados: AtualizarOrdemServicoDto): Promise<OrdemServicoDetalhada> {
    const ordem = await this.encontrar(id);
    Object.assign(ordem, dados);
    const salva = await this.ordensRepositorio.save(ordem);
    salva.itens = ordem.itens;
    return this.detalharOrdem(salva);
  }

  /** Altera o status da ordem e trata a conclusao (baixa financeira). */
  async alterarStatusOrdem(id: number, status: StatusOrdem): Promise<OrdemServicoDetalhada> {
    const ordem = await this.encontrar(id);
    if (ordem.status === StatusOrdem.CONCLUIDA && status !== StatusOrdem.CONCLUIDA) {
      throw new BadRequestException('Uma ordem concluida nao pode voltar de status.');
    }

    ordem.status = status;
    if (status === StatusOrdem.CONCLUIDA) {
      ordem.dataConclusao = dataDeHoje();
    }
    const salva = await this.ordensRepositorio.save(ordem);
    salva.itens = ordem.itens;
    if (status === StatusOrdem.CONCLUIDA) {
      await this.registrarRecebimentoDaOrdem(salva);
    }
    return this.detalharOrdem(salva);
  }

  /**
   * Adiciona um servico ou peca a ordem.
   * Quando o item e uma peca, o estoque é reservado imediatamente.
   */
  async adicionarItem(id: number, dados: AdicionarItemOrdemDto): Promise<OrdemServicoDetalhada> {
    const ordem = await this.encontrar(id);
    if (ordem.status === StatusOrdem.CONCLUIDA || ordem.status === StatusOrdem.CANCELADA) {
      throw new BadRequestException('Nao e possivel alterar itens de uma ordem finalizada.');
    }

    let nome: string;
    let valorUnitario: number;

    const item = this.itensRepositorio.create({
      tipo: dados.tipo,
      quantidade: dados.quantidade,
      ordemServicoId: ordem.id,
      servicoId: null,
      pecaId: null,
    });

    if (dados.tipo === TipoItemOrdem.PECA) {
      const peca = await this.pecasService.buscarPecaPorId(dados.referenciaId);
      await this.pecasService.registrarSaida(peca.id, dados.quantidade);
      nome = peca.nome;
      valorUnitario = peca.precoUnitario;
      item.pecaId = peca.id;
    } else {
      const servico = await this.servicosService.buscarServicoPorId(dados.referenciaId);
      nome = servico.descricao;
      valorUnitario = servico.preco;
      item.servicoId = servico.id;
    }

    item.nome = nome;
    item.valorUnitario = valorUnitario;
    item.valorTotal = arredondarMoeda(valorUnitario * dados.quantidade);
    await this.itensRepositorio.save(item);

    ordem.itens = await this.itensRepositorio.findBy({ ordemServicoId: ordem.id });
    this.recalcularTotal(ordem);
    const salva = await this.ordensRepositorio.save(ordem);
    salva.itens = ordem.itens;
    return this.detalharOrdem(salva);
  }

  /** Remove um item da ordem, devolvendo pecas ao estoque. */
  async removerItem(id: number, itemId: number): Promise<OrdemServicoDetalhada> {
    const ordem = await this.encontrar(id);
    const item = ordem.itens.find((registro) => registro.id === itemId);
    if (!item) throw new NotFoundException('Item nao encontrado nesta ordem.');

    if (item.tipo === TipoItemOrdem.PECA && item.pecaId) {
      await this.pecasService.registrarEntrada(item.pecaId, item.quantidade);
    }
    await this.itensRepositorio.delete({ id: itemId });

    ordem.itens = await this.itensRepositorio.findBy({ ordemServicoId: ordem.id });
    this.recalcularTotal(ordem);
    const salva = await this.ordensRepositorio.save(ordem);
    salva.itens = ordem.itens;
    return this.detalharOrdem(salva);
  }

  /** Cancela a ordem e devolve as pecas utilizadas ao estoque. */
  async cancelarOrdem(id: number): Promise<OrdemServicoDetalhada> {
    const ordem = await this.encontrar(id);
    if (ordem.status === StatusOrdem.CONCLUIDA) {
      throw new BadRequestException('Uma ordem concluida nao pode ser cancelada.');
    }
    for (const item of ordem.itens.filter((item) => item.tipo === TipoItemOrdem.PECA)) {
      if (item.pecaId) await this.pecasService.registrarEntrada(item.pecaId, item.quantidade);
    }
    ordem.status = StatusOrdem.CANCELADA;
    const salva = await this.ordensRepositorio.save(ordem);
    salva.itens = ordem.itens;
    return this.detalharOrdem(salva);
  }

  /** Quantidade de ordens agrupada por status - usado no dashboard. */
  async contarOrdensPorStatus(): Promise<Record<string, number>> {
    const contagem: Record<string, number> = {};
    Object.values(StatusOrdem).forEach((status) => (contagem[status] = 0));
    const ordens = await this.ordensRepositorio.find();
    ordens.forEach((ordem) => (contagem[ordem.status] += 1));
    return contagem;
  }

  private async registrarRecebimentoDaOrdem(ordem: OrdemServico): Promise<void> {
    const jaRegistrado = await this.movimentacoesRepositorio.findOneBy({ ordemId: ordem.id });
    if (jaRegistrado || ordem.valorTotal <= 0) return;

    const data = dataDeHoje();
    const caixa = await this.caixaService.garantirCaixaDoDia(data);
    const movimentacao = this.movimentacoesRepositorio.create({
      data,
      descricao: `Recebimento ${ordem.numero}`,
      tipo: TipoMovimentacao.ENTRADA,
      categoria: 'Ordem de servico',
      formaPagamento: FormaPagamento.PIX,
      valor: ordem.valorTotal,
      ordemId: ordem.id,
      caixaId: caixa.id,
    });
    await this.movimentacoesRepositorio.save(movimentacao);
    await this.caixaService.atualizarTotaisDoCaixa(data);
  }

  private recalcularTotal(ordem: OrdemServico): void {
    ordem.valorTotal = arredondarMoeda(
      ordem.itens.reduce((total, item) => total + item.valorTotal, 0),
    );
  }

  private async gerarNumeroOrdem(): Promise<string> {
    const ano = new Date().getFullYear();
    const total = await this.ordensRepositorio.count();
    const sequencial = String(total + 148).padStart(4, '0');
    return `OS-${ano}-${sequencial}`;
  }

  private async encontrar(id: number): Promise<OrdemServico> {
    const ordem = await this.ordensRepositorio.findOne({ where: { id }, relations: { itens: true } });
    if (!ordem) throw new NotFoundException(`Ordem de servico ${id} nao encontrada.`);
    return ordem;
  }

  private mapearItem(item: ItemOrdem): ItemOrdemApi {
    return {
      id: item.id,
      tipo: item.tipo,
      referenciaId: item.tipo === TipoItemOrdem.PECA ? item.pecaId! : item.servicoId!,
      nome: item.nome,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
    };
  }

  private async detalharOrdem(ordem: OrdemServico): Promise<OrdemServicoDetalhada> {
    const cliente = await this.clientesRepositorio.findOneBy({ id: ordem.clienteId });
    const veiculo = await this.veiculosRepositorio.findOneBy({ id: ordem.veiculoId });
    const itens = ordem.itens.map((item) => this.mapearItem(item));
    const somar = (tipo: TipoItemOrdem) =>
      arredondarMoeda(
        itens.filter((item) => item.tipo === tipo).reduce((total, item) => total + item.valorTotal, 0),
      );

    return {
      id: ordem.id,
      numero: ordem.numero,
      clienteId: ordem.clienteId,
      veiculoId: ordem.veiculoId,
      dataAbertura: ordem.dataAbertura,
      dataConclusao: ordem.dataConclusao,
      status: ordem.status,
      observacoes: ordem.observacoes,
      itens,
      valorTotal: ordem.valorTotal,
      nomeCliente: cliente?.nome ?? '-',
      telefoneCliente: cliente?.telefone ?? '-',
      descricaoVeiculo: veiculo ? `${veiculo.marca} ${veiculo.modelo}` : '-',
      placaVeiculo: veiculo?.placa ?? '-',
      totalServicos: somar(TipoItemOrdem.SERVICO),
      totalPecas: somar(TipoItemOrdem.PECA),
    };
  }
}
