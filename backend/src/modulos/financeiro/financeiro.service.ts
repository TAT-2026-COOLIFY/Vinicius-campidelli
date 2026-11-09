import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { arredondarMoeda, dataDeHoje } from '../../comum/formatadores';
import { MovimentacaoFinanceira, OrdemServico, StatusOrdem, TipoMovimentacao } from '../../modelos';
import { CaixaService } from '../caixa/caixa.service';
import { AtualizarMovimentacaoDto, CriarMovimentacaoDto } from './movimentacao.dto';

/** Totais consolidados apresentados nos cards do modulo financeiro. */
export interface ResumoFinanceiro {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  totalServicosConcluidos: number;
  ticketMedio: number;
}

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(MovimentacaoFinanceira)
    private readonly movimentacoesRepositorio: Repository<MovimentacaoFinanceira>,
    @InjectRepository(OrdemServico) private readonly ordensRepositorio: Repository<OrdemServico>,
    private readonly caixaService: CaixaService,
  ) {}

  /** Lista as movimentacoes financeiras, opcionalmente filtradas por tipo. */
  async listarMovimentacoes(tipo?: TipoMovimentacao): Promise<MovimentacaoFinanceira[]> {
    const lista = tipo
      ? await this.movimentacoesRepositorio.findBy({ tipo })
      : await this.movimentacoesRepositorio.find();
    return [...lista].sort((a, b) => b.data.localeCompare(a.data));
  }

  /** Consolida entradas, saidas e saldo do periodo. */
  async obterResumoFinanceiro(): Promise<ResumoFinanceiro> {
    const totalEntradas = await this.somar(TipoMovimentacao.ENTRADA);
    const totalSaidas = await this.somar(TipoMovimentacao.SAIDA);
    const ordens = await this.ordensRepositorio.findBy({ status: StatusOrdem.CONCLUIDA });
    const faturamento = ordens.reduce((total, ordem) => total + ordem.valorTotal, 0);

    return {
      totalEntradas,
      totalSaidas,
      saldo: arredondarMoeda(totalEntradas - totalSaidas),
      totalServicosConcluidos: ordens.length,
      ticketMedio: ordens.length ? arredondarMoeda(faturamento / ordens.length) : 0,
    };
  }

  /** Faturamento agrupado por dia - alimenta o grafico do dashboard. */
  async obterFaturamentoPorDia(): Promise<{ data: string; entradas: number; saidas: number }[]> {
    const movimentacoes = await this.movimentacoesRepositorio.find();
    const mapa = new Map<string, { entradas: number; saidas: number }>();
    movimentacoes.forEach((movimentacao) => {
      const registro = mapa.get(movimentacao.data) ?? { entradas: 0, saidas: 0 };
      if (movimentacao.tipo === TipoMovimentacao.ENTRADA) registro.entradas += movimentacao.valor;
      else registro.saidas += movimentacao.valor;
      mapa.set(movimentacao.data, registro);
    });

    return [...mapa.entries()]
      .map(([data, valores]) => ({ data, ...valores }))
      .sort((a, b) => a.data.localeCompare(b.data));
  }

  /** Registra uma nova movimentacao financeira. */
  async registrarMovimentacao(dados: CriarMovimentacaoDto): Promise<MovimentacaoFinanceira> {
    const data = dados.data ?? dataDeHoje();
    const caixa = await this.caixaService.garantirCaixaDoDia(data);
    const movimentacao = this.movimentacoesRepositorio.create({
      data,
      descricao: dados.descricao,
      tipo: dados.tipo,
      categoria: dados.categoria,
      formaPagamento: dados.formaPagamento,
      valor: dados.valor,
      ordemId: null,
      caixaId: caixa.id,
    });
    const salva = await this.movimentacoesRepositorio.save(movimentacao);
    await this.caixaService.atualizarTotaisDoCaixa(data);
    return salva;
  }

  /** Atualiza uma movimentacao existente. */
  async atualizarMovimentacao(id: number, dados: AtualizarMovimentacaoDto): Promise<MovimentacaoFinanceira> {
    const movimentacao = await this.movimentacoesRepositorio.findOneBy({ id });
    if (!movimentacao) throw new NotFoundException(`Movimentacao ${id} nao encontrada.`);
    const dataAnterior = movimentacao.data;
    Object.assign(movimentacao, dados);
    if (movimentacao.data !== dataAnterior) {
      const caixa = await this.caixaService.garantirCaixaDoDia(movimentacao.data);
      movimentacao.caixaId = caixa.id;
    }
    const salva = await this.movimentacoesRepositorio.save(movimentacao);
    await this.caixaService.atualizarTotaisDoCaixa(movimentacao.data);
    if (movimentacao.data !== dataAnterior) await this.caixaService.atualizarTotaisDoCaixa(dataAnterior);
    return salva;
  }

  /** Exclui uma movimentacao. */
  async removerMovimentacao(id: number): Promise<void> {
    const movimentacao = await this.movimentacoesRepositorio.findOneBy({ id });
    await this.movimentacoesRepositorio.delete({ id });
    if (movimentacao) await this.caixaService.atualizarTotaisDoCaixa(movimentacao.data);
  }

  private async somar(tipo: TipoMovimentacao): Promise<number> {
    const movimentacoes = await this.movimentacoesRepositorio.findBy({ tipo });
    return arredondarMoeda(movimentacoes.reduce((total, movimentacao) => total + movimentacao.valor, 0));
  }
}
