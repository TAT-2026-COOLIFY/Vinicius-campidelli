import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { AtualizarServicoDto, CriarServicoDto } from './servico.dto';
import { ServicosService } from './servicos.service';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Get()
  listar() {
    return this.servicosService.listarServicos();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.servicosService.buscarServicoPorId(id);
  }

  @Post()
  cadastrar(@Body() dados: CriarServicoDto) {
    return this.servicosService.cadastrarServico(dados);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarServicoDto) {
    return this.servicosService.atualizarServico(id, dados);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) {
    this.servicosService.removerServico(id);
  }
}
