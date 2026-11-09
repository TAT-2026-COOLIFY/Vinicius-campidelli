export interface Peca {
  id: number;
  codigo: string;
  nome: string;
  marca: string;
  quantidade: number;
  quantidadeMinima: number;
  precoUnitario: number;
}

export type PecaPayload = Omit<Peca, 'id'>;
