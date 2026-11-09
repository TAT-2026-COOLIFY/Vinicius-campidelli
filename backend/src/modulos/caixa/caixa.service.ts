import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { arredondarMoeda, dataDeHoje } from '../../comum/formatadores';
import { Caixa, MovimentacaoFinanceira, TipoMovimentacao } from '../../modelos';

@Injectable()
export class CaixaService {
  constructor(
    @InjectRepository(Caixa) private readonly caixasRepositorio: Repository<Caixa>,
    @InjectRepository(MovimentacaoFinanceira)
    private readonly movimentacoesRepositorio: Repository<MovimentacaoFinanceira>,
  ) {}

  /** Lista os caixas ja fechados e o caixa do dia. */
  async listarCaixas(): Promise<Caixa[]> {
    await this.sincronizarCaixaDoDia();
    const caixas = await this.caixasRepositorio.find();

    for (const caixa of caixas.filter((registro) => registro.aberto)) {
      await this.recalcular(caixa);
      await this.caixasRepositorio.save(caixa);
    }

    return caixas.sort((a, b) => b.data.localeCompare(a.data));
  }

  /** Retorna o caixa aberto do dia atual. */
  obterCaixaDoDia(): Promise<Caixa> {
    return this.sincronizarCaixaDoDia();
  }

  /** Lista as movimentacoes de um dia especifico. */
  listarMovimentacoesDoCaixa(data: string): Promise<MovimentacaoFinanceira[]> {
    return this.movimentacoesRepositorio.findBy({ data });
  }

  /** Fecha o caixa de uma data, consolidando entradas e saidas. */
  async fecharCaixa(id: number): Promise<Caixa> {
    const caixa = await this.caixasRepositorio.findOneBy({ id });
    if (!caixa) throw new NotFoundException(`Caixa ${id} nao encontrado.`);
    await this.recalcular(caixa);
    caixa.aberto = false;
    return this.caixasRepositorio.save(caixa);
  }

  /**
   * Garante a existencia do caixa de uma data (sem recalcular totais), para que
   * movimentacoes financeiras possam referencia-lo pela chave estrangeira caixaId.
   */
  async garantirCaixaDoDia(data: string): Promise<Caixa> {
    const caixa = await this.caixasRepositorio.findOneBy({ data });
    if (caixa) return caixa;
    return this.caixasRepositorio.save(
      this.caixasRepositorio.create({
        data,
        totalEntradas: 0,
        totalSaidas: 0,
        saldo: 0,
        aberto: true,
      }),
    );
  }

  /**
   * Recalcula os totais do caixa de uma data, se ele estiver aberto. Deve ser
   * chamado sempre que uma movimentacao daquela data for criada, alterada ou removida.
   */
  async atualizarTotaisDoCaixa(data: string): Promise<void> {
    const caixa = await this.caixasRepositorio.findOneBy({ data });
    if (!caixa || !caixa.aberto) return;
    await this.recalcular(caixa);
    await this.caixasRepositorio.save(caixa);
  }

  /** Recalcula (ou cria) o caixa do dia corrente a partir das movimentacoes. */
  private async sincronizarCaixaDoDia(): Promise<Caixa> {
    const hoje = dataDeHoje();
    let caixa = await this.garantirCaixaDoDia(hoje);

    if (caixa.aberto) {
      await this.recalcular(caixa);
      caixa = await this.caixasRepositorio.save(caixa);
    }
    return caixa;
  }

  private async recalcular(caixa: Caixa): Promise<void> {
    const movimentacoes = await this.listarMovimentacoesDoCaixa(caixa.data);
    caixa.totalEntradas = arredondarMoeda(
      movimentacoes
        .filter((movimentacao) => movimentacao.tipo === TipoMovimentacao.ENTRADA)
        .reduce((total, movimentacao) => total + movimentacao.valor, 0),
    );
    caixa.totalSaidas = arredondarMoeda(
      movimentacoes
        .filter((movimentacao) => movimentacao.tipo === TipoMovimentacao.SAIDA)
        .reduce((total, movimentacao) => total + movimentacao.valor, 0),
    );
    caixa.saldo = arredondarMoeda(caixa.totalEntradas - caixa.totalSaidas);
  }
}
