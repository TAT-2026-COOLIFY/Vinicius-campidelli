import { StatusOrdem, TipoItemOrdem } from './enums';

export interface ItemOrdem {
  id: number;
  tipo: TipoItemOrdem;
  referenciaId: number;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface OrdemServico {
  id: number;
  numero: string;
  clienteId: number;
  veiculoId: number;
  dataAbertura: string;
  dataConclusao: string | null;
  status: StatusOrdem;
  observacoes: string;
  itens: ItemOrdem[];
  valorTotal: number;
  nomeCliente: string;
  telefoneCliente: string;
  descricaoVeiculo: string;
  placaVeiculo: string;
  totalServicos: number;
  totalPecas: number;
}

export interface OrdemServicoPayload {
  clienteId: number;
  veiculoId: number;
  observacoes: string;
}

export interface ItemOrdemPayload {
  tipo: TipoItemOrdem;
  referenciaId: number;
  quantidade: number;
}
