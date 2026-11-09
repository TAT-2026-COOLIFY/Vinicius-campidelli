import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StatusOrdem, TipoItemOrdem } from '../../modelos';

export class CriarOrdemServicoDto {
  @IsInt({ message: 'Selecione o cliente.' })
  clienteId: number;

  @IsInt({ message: 'Selecione o veiculo.' })
  veiculoId: number;

  @IsString() @IsOptional()
  observacoes?: string;
}

export class AtualizarOrdemServicoDto {
  @IsString() @IsOptional()
  observacoes?: string;

  @IsEnum(StatusOrdem) @IsOptional()
  status?: StatusOrdem;
}

export class AlterarStatusOrdemDto {
  @IsEnum(StatusOrdem, { message: 'Status invalido para a ordem de servico.' })
  status: StatusOrdem;
}

export class AdicionarItemOrdemDto {
  @IsEnum(TipoItemOrdem, { message: 'Informe se o item e um servico ou uma peca.' })
  tipo: TipoItemOrdem;

  @IsInt({ message: 'Selecione o item que sera adicionado.' })
  referenciaId: number;

  @IsInt() @Min(1, { message: 'A quantidade deve ser maior que zero.' })
  quantidade: number;
}
