import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SituacaoAgendamento } from '../../modelos';

export class CriarAgendamentoDto {
  @IsInt({ message: 'Selecione o cliente.' })
  clienteId: number;

  @IsInt({ message: 'Selecione o veiculo.' })
  veiculoId: number;

  @IsInt({ message: 'Selecione o servico.' })
  servicoId: number;

  @IsString() @IsNotEmpty({ message: 'Escolha a data do agendamento.' })
  data: string;

  @IsString() @IsNotEmpty({ message: 'Escolha o horario do agendamento.' })
  horario: string;

  @IsString() @IsOptional()
  observacao?: string;

  @IsEnum(SituacaoAgendamento) @IsOptional()
  situacao?: SituacaoAgendamento;
}

export class AtualizarAgendamentoDto extends PartialType(CriarAgendamentoDto) {}

export class AlterarSituacaoAgendamentoDto {
  @IsEnum(SituacaoAgendamento, { message: 'Situacao invalida.' })
  situacao: SituacaoAgendamento;
}
