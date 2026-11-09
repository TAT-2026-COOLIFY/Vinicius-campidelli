import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CriarClienteDto {
  @IsString() @IsNotEmpty({ message: 'Informe o nome do cliente.' }) @MaxLength(120)
  nome: string;

  @IsString() @IsNotEmpty({ message: 'Informe o telefone do cliente.' })
  telefone: string;

  @IsEmail({}, { message: 'Informe um e-mail valido.' })
  email: string;

  @IsString() @IsNotEmpty({ message: 'Informe o endereco do cliente.' })
  endereco: string;

  @IsString()
  cidade: string;
}

export class AtualizarClienteDto extends PartialType(CriarClienteDto) {}
