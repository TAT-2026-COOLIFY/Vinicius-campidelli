import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Agendamento, Cliente, OrdemServico, SituacaoAgendamento, StatusOrdem, Veiculo } from '../../modelos';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { OrdensServicoService } from '../ordens-servico/ordens-servico.service';
import { PecasService } from '../pecas/pecas.service';
import { ServicosService } from '../servicos/servicos.service';

/** Indicadores exibidos nos cards do dashboard. */
export interface IndicadoresDashboard {
  clientesCadastrados: number;
  veiculosCadastrados: number;
  ordensEmAndamento: number;
  ordensConcluidas: number;
  servicosAgendados: number;
  valorMovimentado: number;
}

const STATUS_EM_ANDAMENTO = [
  StatusOrdem.ABERTA,
  StatusOrdem.AGUARDANDO_ATENDIMENTO,
  StatusOrdem.EM_ANDAMENTO,
  StatusOrdem.AGUARDANDO_PECAS,
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Cliente) private readonly clientesRepositorio: Repository<Cliente>,
    @InjectRepository(Veiculo) private readonly veiculosRepositorio: Repository<Veiculo>,
    @InjectRepository(OrdemServico) private readonly ordensRepositorio: Repository<OrdemServico>,
    @InjectRepository(Agendamento) private readonly agendamentosRepositorio: Repository<Agendamento>,
    private readonly ordensServicoService: OrdensServicoService,
    private readonly financeiroService: FinanceiroService,
    private readonly pecasService: PecasService,
    private readonly servicosService: ServicosService,
  ) {}

  /** Numeros principais da operacao. */
  async obterIndicadores(): Promise<IndicadoresDashboard> {
    const [clientesCadastrados, veiculosCadastrados, ordensEmAndamento, ordensConcluidas, servicosAgendados, resumo] =
      await Promise.all([
        this.clientesRepositorio.count(),
        this.veiculosRepositorio.count(),
        this.ordensRepositorio.countBy(STATUS_EM_ANDAMENTO.map((status) => ({ status }))),
        this.ordensRepositorio.countBy({ status: StatusOrdem.CONCLUIDA }),
        this.agendamentosRepositorio.countBy({ situacao: Not(SituacaoAgendamento.CANCELADO) }),
        this.financeiroService.obterResumoFinanceiro(),
      ]);

    return {
      clientesCadastrados,
      veiculosCadastrados,
      ordensEmAndamento,
      ordensConcluidas,
      servicosAgendados,
      valorMovimentado: resumo.totalEntradas,
    };
  }

  /** Consolida tudo o que o dashboard precisa em uma unica chamada. */
  async obterVisaoGeral() {
    const [indicadores, ordensPorStatus, faturamentoPorDia, pecasEstoqueBaixo, ultimasOrdens, servicosMaisExecutados] =
      await Promise.all([
        this.obterIndicadores(),
        this.ordensServicoService.contarOrdensPorStatus(),
        this.financeiroService.obterFaturamentoPorDia(),
        this.pecasService.listarPecasComEstoqueBaixo(),
        this.ordensServicoService.listarOrdens(),
        this.servicosService.listarMaisExecutados(),
      ]);

    return {
      indicadores,
      ordensPorStatus,
      faturamentoPorDia,
      pecasEstoqueBaixo,
      ultimasOrdens: ultimasOrdens.slice(0, 5),
      servicosMaisExecutados,
    };
  }
}
