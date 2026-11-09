export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  criadoEm: string;
}

/** Dados enviados no cadastro e na edicao de um cliente. */
export type ClientePayload = Omit<Cliente, 'id' | 'criadoEm'>;
