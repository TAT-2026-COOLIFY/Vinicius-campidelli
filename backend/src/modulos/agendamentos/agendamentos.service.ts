import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Agendamento, Cliente, Servico, SituacaoAgendamento, Veiculo } from '../../modelos';
import { AtualizarAgendamentoDto, CriarAgendamentoDto } from './agendamento.dto';

/** Agendamento com cliente, veiculo e servico resolvidos para exibicao. */
export interface AgendamentoDetalhado extends Agendamento {
  nomeCliente: string;
  descricaoVeiculo: string;
  descricaoServico: string;
  valorServico: number;
}

/** Horarios de atendimento da oficina. */
export const HORARIOS_DISPONIVEIS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

@Injectable()
export class AgendamentosService {
  constructor(
    @InjectRepository(Agendamento) private readonly agendamentosRepositorio: Repository<Agendamento>,
    @InjectRepository(Cliente) private readonly clientesRepositorio: Repository<Cliente>,
    @InjectRepository(Veiculo) private readonly veiculosRepositorio: Repository<Veiculo>,
    @InjectRepository(Servico) private readonly servicosRepositorio: Repository<Servico>,
  ) {}

  /** Lista os agendamentos, com filtro opcional por data. */
  async listarAgendamentos(data?: string): Promise<AgendamentoDetalhado[]> {
    const lista = data
      ? await this.agendamentosRepositorio.findBy({ data })
      : await this.agendamentosRepositorio.find();
    const detalhados = await Promise.all(lista.map((agendamento) => this.detalharAgendamento(agendamento)));
    return detalhados.sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`));
  }

  /** Retorna os horarios ainda livres em uma data. */
  async listarHorariosLivres(data: string): Promise<string[]> {
    const agendamentos = await this.agendamentosRepositorio.findBy({ data });
    const ocupados = agendamentos
      .filter((agendamento) => agendamento.situacao !== SituacaoAgendamento.CANCELADO)
      .map((agendamento) => agendamento.horario);
    return HORARIOS_DISPONIVEIS.filter((horario) => !ocupados.includes(horario));
  }

  /** Cria um agendamento validando a disponibilidade do horario. */
  async agendarServico(dados: CriarAgendamentoDto): Promise<AgendamentoDetalhado> {
    await this.validarDisponibilidade(dados.data, dados.horario);

    const agendamento = this.agendamentosRepositorio.create({
      clienteId: dados.clienteId,
      veiculoId: dados.veiculoId,
      servicoId: dados.servicoId,
      data: dados.data,
      horario: dados.horario,
      observacao: dados.observacao ?? '',
      situacao: dados.situacao ?? SituacaoAgendamento.AGENDADO,
    });
    const salvo = await this.agendamentosRepositorio.save(agendamento);
    return this.detalharAgendamento(salvo);
  }

  /** Atualiza um agendamento existente. */
  async atualizarAgendamento(id: number, dados: AtualizarAgendamentoDto): Promise<AgendamentoDetalhado> {
    const agendamento = await this.encontrar(id);
    const mudouHorario =
      (dados.data && dados.data !== agendamento.data) ||
      (dados.horario && dados.horario !== agendamento.horario);
    if (mudouHorario) {
      await this.validarDisponibilidade(dados.data ?? agendamento.data, dados.horario ?? agendamento.horario, id);
    }
    Object.assign(agendamento, dados);
    const salvo = await this.agendamentosRepositorio.save(agendamento);
    return this.detalharAgendamento(salvo);
  }

  /** Altera a situacao de um agendamento (fluxo de acompanhamento do servico). */
  async alterarSituacaoAgendamento(id: number, situacao: SituacaoAgendamento): Promise<AgendamentoDetalhado> {
    const agendamento = await this.encontrar(id);
    agendamento.situacao = situacao;
    const salvo = await this.agendamentosRepositorio.save(agendamento);
    return this.detalharAgendamento(salvo);
  }

  /** Cancela um agendamento sem remove-lo do historico. */
  async cancelarAgendamento(id: number): Promise<AgendamentoDetalhado> {
    const agendamento = await this.encontrar(id);
    agendamento.situacao = SituacaoAgendamento.CANCELADO;
    const salvo = await this.agendamentosRepositorio.save(agendamento);
    return this.detalharAgendamento(salvo);
  }

  /** Exclui definitivamente um agendamento. */
  async removerAgendamento(id: number): Promise<void> {
    const agendamento = await this.encontrar(id);
    await this.agendamentosRepositorio.remove(agendamento);
  }

  private async validarDisponibilidade(data: string, horario: string, ignorarId?: number): Promise<void> {
    if (!HORARIOS_DISPONIVEIS.includes(horario)) {
      throw new BadRequestException(
        `O horario ${horario} nao faz parte da grade de atendimento da oficina.`,
      );
    }

    const ocupado = await this.agendamentosRepositorio.findOneBy({
      data,
      horario,
      situacao: Not(SituacaoAgendamento.CANCELADO),
      ...(ignorarId ? { id: Not(ignorarId) } : {}),
    });
    if (ocupado) {
      throw new BadRequestException(`O horario ${horario} do dia ${data} ja esta ocupado.`);
    }
  }

  private async encontrar(id: number): Promise<Agendamento> {
    const agendamento = await this.agendamentosRepositorio.findOneBy({ id });
    if (!agendamento) throw new NotFoundException(`Agendamento ${id} nao encontrado.`);
    return agendamento;
  }

  private async detalharAgendamento(agendamento: Agendamento): Promise<AgendamentoDetalhado> {
    const cliente = await this.clientesRepositorio.findOneBy({ id: agendamento.clienteId });
    const veiculo = await this.veiculosRepositorio.findOneBy({ id: agendamento.veiculoId });
    const servico = await this.servicosRepositorio.findOneBy({ id: agendamento.servicoId });
    return {
      ...agendamento,
      nomeCliente: cliente?.nome ?? '-',
      descricaoVeiculo: veiculo ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}` : '-',
      descricaoServico: servico?.descricao ?? '-',
      valorServico: servico?.preco ?? 0,
    };
  }
}
