import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CriarVeiculoDto {
  @IsString() @IsNotEmpty({ message: 'Informe o modelo do veiculo.' })
  modelo: string;

  @IsString() @IsNotEmpty({ message: 'Informe a marca do veiculo.' })
  marca: string;

  @IsString() @IsNotEmpty({ message: 'Informe a placa do veiculo.' })
  placa: string;

  @IsInt() @Min(1950)
  ano: number;

  @IsString()
  cor: string;

  @IsNumber() @Min(0)
  quilometragem: number;

  @IsInt({ message: 'Selecione o cliente proprietario.' })
  clienteId: number;
}

export class AtualizarVeiculoDto extends PartialType(CriarVeiculoDto) {}
