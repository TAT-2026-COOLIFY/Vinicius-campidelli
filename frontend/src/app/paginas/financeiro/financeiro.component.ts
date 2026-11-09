import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderPageComponent } from '../../compartilhado/componentes/header-page/header-page.component';
import { CardDashboardComponent } from '../../compartilhado/componentes/card-dashboard/card-dashboard';
import { EstadoVazioComponent } from '../../compartilhado/componentes/estado-vazio/estado-vazio.component';
import { StatusComponent } from '../../compartilhado/componentes/status/status.component';
import {
  ROTULOS_FORMA_PAGAMENTO,
  ROTULOS_TIPO_MOVIMENTACAO,
  descreverFormaPagamento,
  gerarOpcoes,
} from '../../compartilhado/utilitarios/rotulos';
import {
  FaturamentoDiario,
  FormaPagamento,
  MovimentacaoFinanceira,
  ResumoFinanceiro,
  TipoMovimentacao,
} from '../../nucleo/modelos';
import { FinanceiroService } from '../../nucleo/services/financeiro.service';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgClass,
    ReactiveFormsModule,
    ChartModule,
    DialogModule,
    DropdownModule,
    TableModule,
    TooltipModule,
    HeaderPageComponent,
    CardDashboardComponent,
    EstadoVazioComponent,
    StatusComponent,
  ],
  templateUrl: './financeiro.component.html',
})
export class FinanceiroComponent {
  private readonly financeiroService = inject(FinanceiroService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly confirmacaoService = inject(ConfirmationService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly movimentacoes = signal<MovimentacaoFinanceira[]>([]);
  protected readonly resumo = signal<ResumoFinanceiro | null>(null);
  protected readonly faturamento = signal<FaturamentoDiario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly formularioVisivel = signal(false);

  protected readonly descreverFormaPagamento = descreverFormaPagamento;
  protected readonly opcoesTipo = gerarOpcoes(ROTULOS_TIPO_MOVIMENTACAO);
  protected readonly opcoesFormaPagamento = gerarOpcoes(ROTULOS_FORMA_PAGAMENTO);

  protected readonly dadosGrafico = computed(() => ({
    labels: this.faturamento().map((registro) => this.formatarDiaMes(registro.data)),
    datasets: [
      {
        type: 'bar',
        label: 'Entradas',
        data: this.faturamento().map((registro) => registro.entradas),
        backgroundColor: '#2A8CF0',
        borderRadius: 6,
        barThickness: 16,
      },
      {
        type: 'bar',
        label: 'Saídas',
        data: this.faturamento().map((registro) => registro.saidas),
        backgroundColor: '#CBD5E1',
        borderRadius: 6,
        barThickness: 16,
      },
    ],
  }));

  protected readonly opcoesGrafico = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { border: { display: false }, grid: { color: '#EEF2F7' }, ticks: { font: { size: 11 } } },
    },
  };

  protected readonly formulario = this.formBuilder.nonNullable.group({
    descricao: ['', [Validators.required, Validators.minLength(3)]],
    tipo: [TipoMovimentacao.ENTRADA, Validators.required],
    categoria: ['', Validators.required],
    formaPagamento: [FormaPagamento.PIX, Validators.required],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    data: [new Date().toISOString().slice(0, 10), Validators.required],
  });

  constructor() {
    this.carregarFinanceiro();
  }

  /** Carrega resumo, gráfico e movimentações do período. */
  protected carregarFinanceiro(): void {
    this.carregando.set(true);
    this.financeiroService.obterResumoFinanceiro().subscribe({
      next: (resumo) => this.resumo.set(resumo),
      error: (erro) =>
        this.notificacaoService.erro(
          'Falha ao carregar o resumo',
          this.notificacaoService.extrairMensagemErro(erro),
        ),
    });
    this.financeiroService.obterFaturamentoPorDia().subscribe({
      next: (dados) => this.faturamento.set(dados),
      error: () => this.faturamento.set([]),
    });
    this.financeiroService.listarMovimentacoes().subscribe({
      next: (movimentacoes) => {
        this.movimentacoes.set(movimentacoes);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  protected abrirLancamento(): void {
    this.formulario.reset({
      descricao: '',
      tipo: TipoMovimentacao.ENTRADA,
      categoria: '',
      formaPagamento: FormaPagamento.PIX,
      valor: 0,
      data: new Date().toISOString().slice(0, 10),
    });
    this.formularioVisivel.set(true);
  }

  /** Registra uma entrada ou saída manual no financeiro. */
  protected registrarMovimentacao(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.financeiroService.registrarMovimentacao(this.formulario.getRawValue()).subscribe({
      next: (movimentacao) => {
        this.salvando.set(false);
        this.formularioVisivel.set(false);
        this.notificacaoService.sucesso('Lançamento registrado', movimentacao.descricao);
        this.carregarFinanceiro();
      },
      error: (erro) => {
        this.salvando.set(false);
        this.notificacaoService.erro(
          'Não foi possível registrar',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  protected confirmarExclusao(movimentacao: MovimentacaoFinanceira): void {
    this.confirmacaoService.confirm({
      header: 'Excluir lançamento',
      message: `Excluir "${movimentacao.descricao}" do histórico financeiro?`,
      icon: 'fa-solid fa-triangle-exclamation',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.financeiroService.excluirMovimentacao(movimentacao.id).subscribe({
          next: () => {
            this.notificacaoService.sucesso('Lançamento excluído', movimentacao.descricao);
            this.carregarFinanceiro();
          },
          error: (erro) =>
            this.notificacaoService.erro(
              'Não foi possível excluir',
              this.notificacaoService.extrairMensagemErro(erro),
            ),
        });
      },
    });
  }

  protected campoInvalido(campo: string): boolean {
    const controle = this.formulario.get(campo);
    return !!controle && controle.invalid && controle.touched;
  }

  protected filtrarTabela(
    tabela: { filterGlobal: (valor: string, modo: string) => void },
    evento: Event,
  ): void {
    tabela.filterGlobal((evento.target as HTMLInputElement).value, 'contains');
  }

  private formatarDiaMes(data: string): string {
    const [, mes, dia] = data.split('-');
    return `${dia}/${mes}`;
  }
}
