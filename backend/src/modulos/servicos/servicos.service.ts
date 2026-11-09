import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agendamento, ItemOrdem, Servico, SituacaoServico } from '../../modelos';
import { AtualizarServicoDto, CriarServicoDto } from './servico.dto';

/** Quantidade de vezes que um servico do catalogo foi lancado em ordens de servico. */
export interface ServicoMaisExecutado {
  servicoId: number;
  descricao: string;
  quantidade: number;
}

@Injectable()
export class ServicosService {
  constructor(
    @InjectRepository(Servico) private readonly servicosRepositorio: Repository<Servico>,
    @InjectRepository(ItemOrdem) private readonly itensRepositorio: Repository<ItemOrdem>,
    @InjectRepository(Agendamento) private readonly agendamentosRepositorio: Repository<Agendamento>,
  ) {}

  /** Lista o catalogo de servicos. */
  listarServicos(): Promise<Servico[]> {
    return this.servicosRepositorio.find();
  }

  /** Busca um servico pelo identificador. */
  async buscarServicoPorId(id: number): Promise<Servico> {
    const servico = await this.servicosRepositorio.findOneBy({ id });
    if (!servico) throw new NotFoundException(`Servico ${id} nao encontrado.`);
    return servico;
  }

  /** Cadastra um novo servico no catalogo. */
  cadastrarServico(dados: CriarServicoDto): Promise<Servico> {
    const servico = this.servicosRepositorio.create({
      situacao: SituacaoServico.ATIVO,
      ...dados,
    });
    return this.servicosRepositorio.save(servico);
  }

  /** Atualiza um servico existente. */
  async atualizarServico(id: number, dados: AtualizarServicoDto): Promise<Servico> {
    const servico = await this.buscarServicoPorId(id);
    Object.assign(servico, dados);
    return this.servicosRepositorio.save(servico);
  }

  /** Lista os servicos mais lancados em ordens de servico, do mais para o menos executado. */
  async listarMaisExecutados(limite = 5): Promise<ServicoMaisExecutado[]> {
    const linhas = await this.itensRepositorio
      .createQueryBuilder('item')
      .select('item.servicoId', 'servicoId')
      .addSelect('SUM(item.quantidade)', 'quantidade')
      .where('item.servicoId IS NOT NULL')
      .groupBy('item.servicoId')
      .orderBy('quantidade', 'DESC')
      .limit(limite)
      .getRawMany<{ servicoId: number; quantidade: string }>();

    return Promise.all(
      linhas.map(async (linha) => {
        const servico = await this.servicosRepositorio.findOneBy({ id: linha.servicoId });
        return {
          servicoId: linha.servicoId,
          descricao: servico?.descricao ?? '-',
          quantidade: Number(linha.quantidade),
        };
      }),
    );
  }

  /** Remove um servico que nao esteja em uso por ordens ou agendamentos. */
  async removerServico(id: number): Promise<void> {
    const servico = await this.buscarServicoPorId(id);
    const emUsoEmOrdem = await this.itensRepositorio.findOneBy({ servicoId: id });
    const emUsoEmAgendamento = await this.agendamentosRepositorio.findOneBy({ servicoId: id });
    if (emUsoEmOrdem || emUsoEmAgendamento) {
      throw new BadRequestException('Nao e possivel excluir: o servico esta em uso.');
    }
    await this.servicosRepositorio.remove(servico);
  }
}
