import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { OrdemServico, Veiculo } from '../../modelos';
import { ClientesService } from '../clientes/clientes.service';
import { AtualizarVeiculoDto, CriarVeiculoDto } from './veiculo.dto';

/** Veiculo com os dados do proprietario ja resolvidos para exibicao em tela. */
export interface VeiculoDetalhado extends Veiculo {
  nomeCliente: string;
  telefoneCliente: string;
}

@Injectable()
export class VeiculosService {
  constructor(
    @InjectRepository(Veiculo) private readonly veiculosRepositorio: Repository<Veiculo>,
    @InjectRepository(OrdemServico) private readonly ordensRepositorio: Repository<OrdemServico>,
    private readonly clientesService: ClientesService,
  ) {}

  /** Lista os veiculos ja com o nome do cliente proprietario. */
  async listarVeiculos(clienteId?: number): Promise<VeiculoDetalhado[]> {
    const veiculos = clienteId
      ? await this.veiculosRepositorio.findBy({ clienteId: Number(clienteId) })
      : await this.veiculosRepositorio.find();
    return Promise.all(veiculos.map((veiculo) => this.detalharVeiculo(veiculo)));
  }

  /** Busca um veiculo pelo identificador. */
  async buscarVeiculoPorId(id: number): Promise<VeiculoDetalhado> {
    const veiculo = await this.veiculosRepositorio.findOneBy({ id });
    if (!veiculo) throw new NotFoundException(`Veiculo ${id} nao encontrado.`);
    return this.detalharVeiculo(veiculo);
  }

  /** Cadastra um veiculo vinculado a um cliente. */
  async cadastrarVeiculo(dados: CriarVeiculoDto): Promise<VeiculoDetalhado> {
    await this.clientesService.buscarClientePorId(dados.clienteId);
    await this.validarPlacaUnica(dados.placa);

    const veiculo = this.veiculosRepositorio.create({ ...dados, placa: dados.placa.toUpperCase() });
    const salvo = await this.veiculosRepositorio.save(veiculo);
    return this.detalharVeiculo(salvo);
  }

  /** Atualiza os dados de um veiculo. */
  async atualizarVeiculo(id: number, dados: AtualizarVeiculoDto): Promise<VeiculoDetalhado> {
    const veiculo = await this.veiculosRepositorio.findOneBy({ id });
    if (!veiculo) throw new NotFoundException(`Veiculo ${id} nao encontrado.`);
    if (dados.clienteId) await this.clientesService.buscarClientePorId(dados.clienteId);
    if (dados.placa) await this.validarPlacaUnica(dados.placa, id);

    Object.assign(veiculo, dados);
    if (dados.placa) veiculo.placa = dados.placa.toUpperCase();
    const salvo = await this.veiculosRepositorio.save(veiculo);
    return this.detalharVeiculo(salvo);
  }

  /** Remove um veiculo que nao esteja vinculado a ordens de servico. */
  async removerVeiculo(id: number): Promise<void> {
    const veiculo = await this.veiculosRepositorio.findOneBy({ id });
    if (!veiculo) throw new NotFoundException(`Veiculo ${id} nao encontrado.`);
    const possuiOrdens = await this.ordensRepositorio.findOneBy({ veiculoId: id });
    if (possuiOrdens) {
      throw new BadRequestException('Nao e possivel excluir: o veiculo possui ordens de servico.');
    }
    await this.veiculosRepositorio.remove(veiculo);
  }

  private async validarPlacaUnica(placa: string, ignorarId?: number): Promise<void> {
    const duplicada = await this.veiculosRepositorio.findOneBy(
      ignorarId
        ? { placa: placa.toUpperCase(), id: Not(ignorarId) }
        : { placa: placa.toUpperCase() },
    );
    if (duplicada) throw new BadRequestException('Ja existe um veiculo cadastrado com esta placa.');
  }

  private async detalharVeiculo(veiculo: Veiculo): Promise<VeiculoDetalhado> {
    const cliente = await this.clientesService.buscarClientePorId(veiculo.clienteId).catch(() => null);
    return {
      ...veiculo,
      nomeCliente: cliente?.nome ?? 'Cliente removido',
      telefoneCliente: cliente?.telefone ?? '-',
    };
  }
}
