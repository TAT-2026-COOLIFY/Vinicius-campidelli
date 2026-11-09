import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { dataDeHoje } from '../../comum/formatadores';
import { Cliente, Veiculo } from '../../modelos';
import { AtualizarClienteDto, CriarClienteDto } from './cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente) private readonly clientesRepositorio: Repository<Cliente>,
    @InjectRepository(Veiculo) private readonly veiculosRepositorio: Repository<Veiculo>,
  ) {}

  /** Lista os clientes, com filtro opcional por nome, e-mail ou telefone. */
  async listarClientes(termo?: string): Promise<Cliente[]> {
    const clientes = await this.clientesRepositorio.find();
    if (!termo) return clientes;
    const busca = termo.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(busca) ||
        cliente.email.toLowerCase().includes(busca) ||
        cliente.telefone.includes(busca),
    );
  }

  /** Busca um cliente pelo identificador. */
  async buscarClientePorId(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepositorio.findOneBy({ id });
    if (!cliente) throw new NotFoundException(`Cliente ${id} nao encontrado.`);
    return cliente;
  }

  /** Cadastra um novo cliente. */
  async cadastrarCliente(dados: CriarClienteDto): Promise<Cliente> {
    const emailJaUsado = await this.clientesRepositorio.findOneBy({ email: dados.email });
    if (emailJaUsado) throw new BadRequestException('Ja existe um cliente com este e-mail.');

    const cliente = this.clientesRepositorio.create({ ...dados, criadoEm: dataDeHoje() });
    return this.clientesRepositorio.save(cliente);
  }

  /** Atualiza os dados de um cliente existente. */
  async atualizarCliente(id: number, dados: AtualizarClienteDto): Promise<Cliente> {
    const cliente = await this.buscarClientePorId(id);
    Object.assign(cliente, dados);
    return this.clientesRepositorio.save(cliente);
  }

  /** Remove um cliente, desde que ele nao possua veiculos vinculados. */
  async removerCliente(id: number): Promise<void> {
    const cliente = await this.buscarClientePorId(id);
    const possuiVeiculos = await this.veiculosRepositorio.findOneBy({ clienteId: id });
    if (possuiVeiculos) {
      throw new BadRequestException('Nao e possivel excluir: o cliente possui veiculos vinculados.');
    }
    await this.clientesRepositorio.remove(cliente);
  }
}
