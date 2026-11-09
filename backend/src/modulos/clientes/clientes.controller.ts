import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { AtualizarClienteDto, CriarClienteDto } from './cliente.dto';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listar(@Query('busca') busca?: string) {
    return this.clientesService.listarClientes(busca);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.buscarClientePorId(id);
  }

  @Post()
  cadastrar(@Body() dados: CriarClienteDto) {
    return this.clientesService.cadastrarCliente(dados);
  }

  @Put(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dados: AtualizarClienteDto) {
    return this.clientesService.atualizarCliente(id, dados);
  }

  @Delete(':id')
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number) {
    this.clientesService.removerCliente(id);
  }
}
