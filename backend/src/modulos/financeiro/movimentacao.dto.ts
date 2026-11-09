import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { FormaPagamento, TipoMovimentacao } from '../../modelos';

export class CriarMovimentacaoDto {
  @IsString() @IsNotEmpty({ message: 'Informe a descricao da movimentacao.' })
  descricao: string;

  @IsEnum(TipoMovimentacao, { message: 'Selecione entrada ou saida.' })
  tipo: TipoMovimentacao;

  @IsString() @IsNotEmpty({ message: 'Informe a categoria.' })
  categoria: string;

  @IsEnum(FormaPagamento)
  formaPagamento: FormaPagamento;

  @IsNumber() @Min(0.01, { message: 'O valor deve ser maior que zero.' })
  valor: number;

  @IsString() @IsOptional()
  data?: string;
}

export class AtualizarMovimentacaoDto extends PartialType(CriarMovimentacaoDto) {}
