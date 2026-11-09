import { SituacaoAgendamento } from './enums';

export interface Agendamento {
  id: number;
  clienteId: number;
  veiculoId: number;
  servicoId: number;
  data: string;
  horario: string;
  situacao: SituacaoAgendamento;
  observacao: string;
  nomeCliente: string;
  descricaoVeiculo: string;
  descricaoServico: string;
  valorServico: number;
}

export interface AgendamentoPayload {
  clienteId: number;
  veiculoId: number;
  servicoId: number;
  data: string;
  horario: string;
  observacao: string;
  situacao?: SituacaoAgendamento;
}
