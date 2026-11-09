import { Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { CaixaService } from './caixa.service';

@Controller('caixa')
export class CaixaController {
  constructor(private readonly caixaService: CaixaService) {}

  @Get()
  listar() {
    return this.caixaService.listarCaixas();
  }

  @Get('hoje')
  obterCaixaDoDia() {
    return this.caixaService.obterCaixaDoDia();
  }

  @Get('movimentacoes')
  listarMovimentacoes(@Query('data') data: string) {
    return this.caixaService.listarMovimentacoesDoCaixa(data);
  }

  @Patch(':id/fechar')
  fechar(@Param('id', ParseIntPipe) id: number) {
    return this.caixaService.fecharCaixa(id);
  }
}
