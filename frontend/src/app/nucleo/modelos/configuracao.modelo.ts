export interface Configuracao {
  id: number;
  nomeFantasia: string;
  cnpj: string;
  telefone: string;
  endereco: string;
  horarioAbertura: string;
  horarioFechamento: string;
  avisoEstoqueMinimo: boolean;
}

export interface ConfiguracaoPayload {
  nomeFantasia: string;
  cnpj: string;
  telefone: string;
  endereco: string;
  horarioAbertura: string;
  horarioFechamento: string;
  avisoEstoqueMinimo: boolean;
}
