import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { AtualizarVeiculoDto, CriarVeiculoDto } from './veiculo.dto';
import { VeiculosService } from './veiculos.service';

@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Get()
  listar(@Query('clienteId') clienteId?: number) {
    return this.veiculosService.listarVeiculos(clienteId);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.veiculosService.buscarVeiculoPorId(id);
  }

  @Post()
  cadastrar(@Body() dados: CriarVeiculoDto) {
    return this.veiculosService.cadastrarVeiculo(dados);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarVeiculoDto) {
    return this.veiculosService.atualizarVeiculo(id, dados);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) {
    this.veiculosService.removerVeiculo(id);
  }
}
