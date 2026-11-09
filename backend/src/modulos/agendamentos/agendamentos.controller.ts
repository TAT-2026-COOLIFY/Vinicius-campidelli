import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { AlterarSituacaoAgendamentoDto, AtualizarAgendamentoDto, CriarAgendamentoDto } from './agendamento.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Get()
  listar(@Query('data') data?: string) {
    return this.agendamentosService.listarAgendamentos(data);
  }

  @Get('horarios-livres')
  listarHorariosLivres(@Query('data') data: string) {
    return this.agendamentosService.listarHorariosLivres(data);
  }

  @Post()
  agendar(@Body() dados: CriarAgendamentoDto) {
    return this.agendamentosService.agendarServico(dados);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarAgendamentoDto) {
    return this.agendamentosService.atualizarAgendamento(id, dados);
  }

  @Patch(':id/situacao')
  alterarSituacao(@Param('id', ParseIntPipe) id: number, @Body() dados: AlterarSituacaoAgendamentoDto) {
    return this.agendamentosService.alterarSituacaoAgendamento(id, dados.situacao);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.agendamentosService.cancelarAgendamento(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) {
    this.agendamentosService.removerAgendamento(id);
  }
}
