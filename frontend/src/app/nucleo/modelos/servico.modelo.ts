import { SituacaoServico } from './enums';

export interface Servico {
  id: number;
  descricao: string;
  preco: number;
  duracaoMinutos: number;
  situacao: SituacaoServico;
}

export type ServicoPayload = Omit<Servico, 'id'>;
