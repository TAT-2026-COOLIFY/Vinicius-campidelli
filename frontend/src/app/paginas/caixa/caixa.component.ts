import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderPageComponent } from '../../compartilhado/componentes/header-page/header-page.component';
import { CardDashboardComponent } from '../../compartilhado/componentes/card-dashboard/card-dashboard';
import { EstadoVazioComponent } from '../../compartilhado/componentes/estado-vazio/estado-vazio.component';
import { StatusComponent } from '../../compartilhado/componentes/status/status.component';
import { descreverFormaPagamento } from '../../compartilhado/utilitarios/rotulos';
import { Caixa, MovimentacaoFinanceira } from '../../nucleo/modelos';
import { CaixaService } from '../../nucleo/services/caixa.service';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';

@Component({
  selector: 'app-caixa',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgClass,
    TableModule,
    TooltipModule,
    HeaderPageComponent,
    CardDashboardComponent,
    EstadoVazioComponent,
    StatusComponent,
  ],
  templateUrl: './caixa.component.html',
})
export class CaixaComponent {
  private readonly caixaService = inject(CaixaService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly confirmacaoService = inject(ConfirmationService);

  protected readonly caixas = signal<Caixa[]>([]);
  protected readonly caixaSelecionado = signal<Caixa | null>(null);
  protected readonly movimentacoesDoDia = signal<MovimentacaoFinanceira[]>([]);
  protected readonly carregando = signal(true);
  protected readonly descreverFormaPagamento = descreverFormaPagamento;

  protected readonly caixaDoDia = computed(() => this.caixas().find((caixa) => caixa.aberto) ?? null);

  constructor() {
    this.carregarCaixas();
  }

  /** Carrega o histórico de caixas e seleciona o mais recente. */
  protected carregarCaixas(): void {
    this.carregando.set(true);
    this.caixaService.listarCaixas().subscribe({
      next: (caixas) => {
        this.caixas.set(caixas);
        this.carregando.set(false);
        if (caixas.length) this.selecionarCaixa(caixas[0]);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Falha ao carregar o caixa',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  /** Mostra as movimentações do dia escolhido. */
  protected selecionarCaixa(caixa: Caixa): void {
    this.caixaSelecionado.set(caixa);
    this.caixaService.listarMovimentacoesDoCaixa(caixa.data).subscribe({
      next: (movimentacoes) => this.movimentacoesDoDia.set(movimentacoes),
      error: () => this.movimentacoesDoDia.set([]),
    });
  }

  /** Fecha o caixa do dia, consolidando entradas e saídas. */
  protected confirmarFechamento(caixa: Caixa): void {
    this.confirmacaoService.confirm({
      header: 'Fechar caixa',
      message: `Fechar o caixa do dia ${this.formatarData(caixa.data)}? Após o fechamento os totais ficam congelados.`,
      icon: 'fa-solid fa-lock',
      accept: () => {
        this.caixaService.fecharCaixa(caixa.id).subscribe({
          next: (caixaFechado) => {
            this.notificacaoService.sucesso(
              'Caixa fechado',
              `Saldo do dia: ${caixaFechado.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
            );
            this.carregarCaixas();
          },
          error: (erro) =>
            this.notificacaoService.erro(
              'Não foi possível fechar',
              this.notificacaoService.extrairMensagemErro(erro),
            ),
        });
      },
    });
  }

  protected formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}
