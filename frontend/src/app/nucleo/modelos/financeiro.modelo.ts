import { FormaPagamento, TipoMovimentacao } from './enums';

export interface MovimentacaoFinanceira {
  id: number;
  data: string;
  descricao: string;
  tipo: TipoMovimentacao;
  categoria: string;
  formaPagamento: FormaPagamento;
  valor: number;
  ordemId: number | null;
}

export type MovimentacaoPayload = Omit<MovimentacaoFinanceira, 'id' | 'ordemId'>;

export interface ResumoFinanceiro {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  totalServicosConcluidos: number;
  ticketMedio: number;
}

export interface FaturamentoDiario {
  data: string;
  entradas: number;
  saidas: number;
}
