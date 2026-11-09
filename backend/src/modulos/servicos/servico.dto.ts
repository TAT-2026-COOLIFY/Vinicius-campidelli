import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SituacaoServico } from '../../modelos';

export class CriarServicoDto {
  @IsString() @IsNotEmpty({ message: 'Informe a descricao do servico.' })
  descricao: string;

  @IsNumber() @Min(0, { message: 'O preco nao pode ser negativo.' })
  preco: number;

  @IsInt() @Min(15)
  duracaoMinutos: number;

  @IsEnum(SituacaoServico) @IsOptional()
  situacao?: SituacaoServico;
}

export class AtualizarServicoDto extends PartialType(CriarServicoDto) {}
