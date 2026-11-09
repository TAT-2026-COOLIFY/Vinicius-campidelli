import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AtualizarConfiguracaoDto {
  @IsString() @IsOptional()
  nomeFantasia?: string;

  @IsString() @IsOptional()
  cnpj?: string;

  @IsString() @IsOptional()
  telefone?: string;

  @IsString() @IsOptional()
  endereco?: string;

  @IsString() @IsOptional()
  horarioAbertura?: string;

  @IsString() @IsOptional()
  horarioFechamento?: string;

  @IsBoolean() @IsOptional()
  avisoEstoqueMinimo?: boolean;
}
