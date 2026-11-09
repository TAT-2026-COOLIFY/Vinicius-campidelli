import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { AtualizarPecaDto, CriarPecaDto, MovimentarEstoqueDto } from './peca.dto';
import { PecasService } from './pecas.service';

@Controller('pecas')
export class PecasController {
  constructor(private readonly pecasService: PecasService) {}

  @Get()
  listar() {
    return this.pecasService.listarPecas();
  }

  @Get('estoque-baixo')
  listarEstoqueBaixo() {
    return this.pecasService.listarPecasComEstoqueBaixo();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.pecasService.buscarPecaPorId(id);
  }

  @Post()
  cadastrar(@Body() dados: CriarPecaDto) {
    return this.pecasService.cadastrarPeca(dados);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarPecaDto) {
    return this.pecasService.atualizarPeca(id, dados);
  }

  @Patch(':id/entrada')
  registrarEntrada(@Param('id', ParseIntPipe) id: number, @Body() dados: MovimentarEstoqueDto) {
    return this.pecasService.registrarEntrada(id, dados.quantidade);
  }

  @Patch(':id/saida')
  registrarSaida(@Param('id', ParseIntPipe) id: number, @Body() dados: MovimentarEstoqueDto) {
    return this.pecasService.registrarSaida(id, dados.quantidade);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) {
    this.pecasService.removerPeca(id);
  }
}
