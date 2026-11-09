import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Configuracao, Peca } from '../../nucleo/modelos';
import { AutenticacaoService } from '../../nucleo/services/autenticacao.service';
import { ConfiguracaoService } from '../../nucleo/services/configuracao.service';
import { PecaService } from '../../nucleo/services/peca.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, BadgeModule, ButtonModule, OverlayPanelModule, CurrencyPipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly pecaService = inject(PecaService);
  private readonly configuracaoService = inject(ConfiguracaoService);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly roteador = inject(Router);

  protected readonly usuario = this.autenticacaoService.usuarioLogado;
  protected readonly alertasEstoque = signal<Peca[]>([]);
  protected readonly avisoEstoqueMinimoAtivo = signal(true);
  protected termoPesquisa = '';

  constructor() {
    this.configuracaoService.obterConfiguracao().subscribe({
      next: (configuracao) => this.aplicarConfiguracao(configuracao),
      error: () => this.alertasEstoque.set([]),
    });

    // Reage imediatamente quando a preferencia e alterada na tela de Configuracoes.
    this.configuracaoService.configuracaoAtualizada$
      .pipe(takeUntilDestroyed())
      .subscribe((configuracao) => this.aplicarConfiguracao(configuracao));
  }

  /**
   * Atualiza o sino de notificações conforme a preferência "aviso de estoque
   * mínimo" definida nas configurações.
   */
  private aplicarConfiguracao(configuracao: Configuracao): void {
    this.avisoEstoqueMinimoAtivo.set(configuracao.avisoEstoqueMinimo);
    if (!configuracao.avisoEstoqueMinimo) {
      this.alertasEstoque.set([]);
      return;
    }
    this.pecaService.listarPecasComEstoqueBaixo().subscribe({
      next: (pecas) => this.alertasEstoque.set(pecas),
      error: () => this.alertasEstoque.set([]),
    });
  }

  /** Direciona a busca para o módulo mais provável do termo digitado. */
  protected pesquisar(): void {
    const termo = this.termoPesquisa.trim();
    if (!termo) return;

    const pareceOrdem = /^os[-\s]?/i.test(termo);
    const parecePlaca = /^[a-z]{3}[-\s]?\d[a-z0-9]\d{2}$/i.test(termo);

    if (pareceOrdem) this.roteador.navigate(['/ordens-servico'], { queryParams: { busca: termo } });
    else if (parecePlaca) this.roteador.navigate(['/veiculos'], { queryParams: { busca: termo } });
    else this.roteador.navigate(['/clientes'], { queryParams: { busca: termo } });

    this.termoPesquisa = '';
  }

  protected irParaEstoque(): void {
    this.roteador.navigate(['/estoque']);
  }
}
