import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CriarPecaDto {
  @IsString() @IsNotEmpty({ message: 'Informe o codigo da peca.' })
  codigo: string;

  @IsString() @IsNotEmpty({ message: 'Informe o nome da peca.' })
  nome: string;

  @IsString() @IsNotEmpty({ message: 'Informe a marca da peca.' })
  marca: string;

  @IsInt() @Min(0, { message: 'A quantidade nao pode ser negativa.' })
  quantidade: number;

  @IsInt() @Min(0)
  quantidadeMinima: number;

  @IsNumber() @Min(0)
  precoUnitario: number;
}

export class AtualizarPecaDto extends PartialType(CriarPecaDto) {}

export class MovimentarEstoqueDto {
  @IsInt() @Min(1, { message: 'Informe uma quantidade maior que zero.' })
  quantidade: number;

  /** Observacao livre: nota fiscal, fornecedor ou ordem relacionada. */
  @IsOptional()
  @IsString()
  observacao?: string;
}
