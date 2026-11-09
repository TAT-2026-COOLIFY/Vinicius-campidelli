export interface Veiculo {
  id: number;
  modelo: string;
  marca: string;
  placa: string;
  ano: number;
  cor: string;
  quilometragem: number;
  clienteId: number;
  nomeCliente: string;
  telefoneCliente: string;
}

export type VeiculoPayload = Omit<Veiculo, 'id' | 'nomeCliente' | 'telefoneCliente'>;
