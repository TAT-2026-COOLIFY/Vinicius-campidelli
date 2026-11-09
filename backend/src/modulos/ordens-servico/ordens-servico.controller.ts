import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { StatusOrdem } from '../../modelos';
import {
  AdicionarItemOrdemDto,
  AlterarStatusOrdemDto,
  AtualizarOrdemServicoDto,
  CriarOrdemServicoDto,
} from './ordem-servico.dto';
import { OrdensServicoService } from './ordens-servico.service';

@Controller('ordens-servico')
export class OrdensServicoController {
  constructor(private readonly ordensServicoService: OrdensServicoService) {}

  @Get()
  listar(@Query('status') status?: StatusOrdem) {
    return this.ordensServicoService.listarOrdens(status);
  }

  @Get('resumo-status')
  resumoPorStatus() {
    return this.ordensServicoService.contarOrdensPorStatus();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.ordensServicoService.buscarOrdemPorId(id);
  }

  @Post()
  criar(@Body() dados: CriarOrdemServicoDto) {
    return this.ordensServicoService.criarOrdem(dados);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarOrdemServicoDto) {
    return this.ordensServicoService.atualizarOrdem(id, dados);
  }

  @Patch(':id/status')
  alterarStatus(@Param('id', ParseIntPipe) id: number, @Body() dados: AlterarStatusOrdemDto) {
    return this.ordensServicoService.alterarStatusOrdem(id, dados.status);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.ordensServicoService.cancelarOrdem(id);
  }

  @Post(':id/itens')
  adicionarItem(@Param('id', ParseIntPipe) id: number, @Body() dados: AdicionarItemOrdemDto) {
    return this.ordensServicoService.adicionarItem(id, dados);
  }

  @Delete(':id/itens/:itemId')
  removerItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.ordensServicoService.removerItem(id, itemId);
  }
}
