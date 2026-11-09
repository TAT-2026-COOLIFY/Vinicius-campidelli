import { FaturamentoDiario } from './financeiro.modelo';
import { OrdemServico } from './ordem-servico.modelo';
import { Peca } from './peca.modelo';

export interface IndicadoresDashboard {
  clientesCadastrados: number;
  veiculosCadastrados: number;
  ordensEmAndamento: number;
  ordensConcluidas: number;
  servicosAgendados: number;
  valorMovimentado: number;
}

export interface ServicoMaisExecutado {
  servicoId: number;
  descricao: string;
  quantidade: number;
}

export interface VisaoGeralDashboard {
  indicadores: IndicadoresDashboard;
  ordensPorStatus: Record<string, number>;
  faturamentoPorDia: FaturamentoDiario[];
  pecasEstoqueBaixo: Peca[];
  ultimasOrdens: OrdemServico[];
  servicosMaisExecutados: ServicoMaisExecutado[];
}
