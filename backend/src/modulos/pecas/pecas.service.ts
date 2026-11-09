import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemOrdem, Peca } from '../../modelos';
import { AtualizarPecaDto, CriarPecaDto } from './peca.dto';

@Injectable()
export class PecasService {
  constructor(
    @InjectRepository(Peca) private readonly pecasRepositorio: Repository<Peca>,
    @InjectRepository(ItemOrdem) private readonly itensRepositorio: Repository<ItemOrdem>,
  ) {}

  /** Lista todas as pecas do estoque. */
  listarPecas(): Promise<Peca[]> {
    return this.pecasRepositorio.find();
  }

  /** Lista apenas as pecas que atingiram o estoque minimo. */
  async listarPecasComEstoqueBaixo(): Promise<Peca[]> {
    const pecas = await this.pecasRepositorio.find();
    return pecas.filter((peca) => peca.quantidade <= peca.quantidadeMinima);
  }

  /** Busca uma peca pelo identificador. */
  async buscarPecaPorId(id: number): Promise<Peca> {
    const peca = await this.pecasRepositorio.findOneBy({ id });
    if (!peca) throw new NotFoundException(`Peca ${id} nao encontrada.`);
    return peca;
  }

  /** Cadastra uma nova peca. */
  async cadastrarPeca(dados: CriarPecaDto): Promise<Peca> {
    const codigoDuplicado = await this.pecasRepositorio.findOneBy({ codigo: dados.codigo });
    if (codigoDuplicado) throw new BadRequestException('Ja existe uma peca com este codigo.');

    const peca = this.pecasRepositorio.create(dados);
    return this.pecasRepositorio.save(peca);
  }

  /** Atualiza os dados cadastrais de uma peca. */
  async atualizarPeca(id: number, dados: AtualizarPecaDto): Promise<Peca> {
    const peca = await this.buscarPecaPorId(id);
    Object.assign(peca, dados);
    return this.pecasRepositorio.save(peca);
  }

  /** Registra entrada de estoque. */
  async registrarEntrada(id: number, quantidade: number): Promise<Peca> {
    const peca = await this.buscarPecaPorId(id);
    peca.quantidade += quantidade;
    return this.pecasRepositorio.save(peca);
  }

  /** Registra saida de estoque, impedindo saldo negativo. */
  async registrarSaida(id: number, quantidade: number): Promise<Peca> {
    const peca = await this.buscarPecaPorId(id);
    if (peca.quantidade < quantidade) {
      throw new BadRequestException(
        `Estoque insuficiente para ${peca.nome}. Disponivel: ${peca.quantidade} unidade(s).`,
      );
    }
    peca.quantidade -= quantidade;
    return this.pecasRepositorio.save(peca);
  }

  /** Remove uma peca do cadastro. */
  async removerPeca(id: number): Promise<void> {
    const peca = await this.buscarPecaPorId(id);
    const emUso = await this.itensRepositorio.findOneBy({ pecaId: id });
    if (emUso) throw new BadRequestException('Nao e possivel excluir: a peca consta em ordens de servico.');
    await this.pecasRepositorio.remove(peca);
  }
}
