import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { HeaderPageComponent } from '../../compartilhado/componentes/header-page/header-page.component';
import { CardDashboardComponent } from '../../compartilhado/componentes/card-dashboard/card-dashboard';
import { StatusComponent } from '../../compartilhado/componentes/status/status.component';
import { descreverStatus } from '../../compartilhado/utilitarios/rotulos';
import { VisaoGeralDashboard } from '../../nucleo/modelos';
import { DashboardService } from '../../nucleo/services/dashboard.service';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    ChartModule,
    SkeletonModule,
    TableModule,
    HeaderPageComponent,
    CardDashboardComponent,
    StatusComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly notificacaoService = inject(NotificacaoService);

  protected readonly carregando = signal(true);
  protected readonly visaoGeral = signal<VisaoGeralDashboard | null>(null);

  /** Série de faturamento (entradas x saídas) exibida no gráfico de linhas */
  protected readonly dadosFaturamento = computed(() => {
    const dados = this.visaoGeral()?.faturamentoPorDia ?? [];
    return {
      labels: dados.map((registro) => this.formatarDiaMes(registro.data)),
      datasets: [
        {
          label: 'Entradas',
          data: dados.map((registro) => registro.entradas),
          borderColor: '#2A8CF0',
          backgroundColor: 'rgba(42, 140, 240, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: 'Saídas',
          data: dados.map((registro) => registro.saidas),
          borderColor: '#94A3B8',
          backgroundColor: 'transparent',
          borderDash: [5, 4],
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    };
  });

  /** distribuição das ordens por status, em barras horizontais. */
  protected readonly dadosOrdensPorStatus = computed(() => {
    const contagem = this.visaoGeral()?.ordensPorStatus ?? {};
    const chaves = Object.keys(contagem).filter((chave) => contagem[chave] > 0);
    return {
      labels: chaves.map((chave) => descreverStatus(chave)),
      datasets: [
        {
          label: 'Ordens',
          data: chaves.map((chave) => contagem[chave]),
          backgroundColor: ['#2A8CF0', '#94A3B8', '#6366F1', '#F59E0B', '#10B981', '#F43F5E'],
          borderRadius: 6,
          maxBarThickness: 18,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    };
  });

  protected readonly opcoesLinha = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { border: { display: false }, grid: { color: '#EEF2F7' }, ticks: { font: { size: 11 } } },
    },
  };

  protected readonly opcoesBarra = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { border: { display: false }, grid: { color: '#EEF2F7' }, ticks: { stepSize: 1, font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  constructor() {
    this.carregarVisaoGeral();
  }

  /** carrega os indicadores, graficos e listas do painel. */
  protected carregarVisaoGeral(): void {
    this.carregando.set(true);
    this.dashboardService.obterVisaoGeral().subscribe({
      next: (dados) => {
        this.visaoGeral.set(dados);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Falha ao carregar o painel',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  private formatarDiaMes(data: string): string {
    const [, mes, dia] = data.split('-');
    return `${dia}/${mes}`;
  }
}
