import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { TipoMovimentacao } from '../../modelos';
import { FinanceiroService } from './financeiro.service';
import { AtualizarMovimentacaoDto, CriarMovimentacaoDto } from './movimentacao.dto';

@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Get('movimentacoes')
  listarMovimentacoes(@Query('tipo') tipo?: TipoMovimentacao) {
    return this.financeiroService.listarMovimentacoes(tipo);
  }

  @Get('resumo')
  obterResumo() {
    return this.financeiroService.obterResumoFinanceiro();
  }

  @Get('faturamento-por-dia')
  obterFaturamentoPorDia() {
    return this.financeiroService.obterFaturamentoPorDia();
  }

  @Post('movimentacoes')
  registrar(@Body() dados: CriarMovimentacaoDto) {
    return this.financeiroService.registrarMovimentacao(dados);
  }

  @Put('movimentacoes/:id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarMovimentacaoDto) {
    return this.financeiroService.atualizarMovimentacao(id, dados);
  }

  @Delete('movimentacoes/:id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) {
    this.financeiroService.removerMovimentacao(id);
  }
}
