import { CurrencyPipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderPageComponent } from '../../compartilhado/componentes/header-page/header-page.component';
import { CardDashboardComponent } from '../../compartilhado/componentes/card-dashboard/card-dashboard';
import { EstadoVazioComponent } from '../../compartilhado/componentes/estado-vazio/estado-vazio.component';
import { Peca } from '../../nucleo/modelos';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';
import { PecaService } from '../../nucleo/services/peca.service';

/** Movimentação manual de estoque. */
type TipoMovimentacaoEstoque = 'ENTRADA' | 'SAIDA';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [
    CurrencyPipe,
    NgClass,
    ReactiveFormsModule,
    DialogModule,
    TableModule,
    TooltipModule,
    HeaderPageComponent,
    CardDashboardComponent,
    EstadoVazioComponent,
  ],
  templateUrl: './estoque.component.html',
})
export class EstoqueComponent {
  private readonly pecaService = inject(PecaService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly confirmacaoService = inject(ConfirmationService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly pecas = signal<Peca[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly pecaEmEdicao = signal<Peca | null>(null);
  protected readonly pecaMovimentada = signal<Peca | null>(null);
  protected readonly tipoMovimentacao = signal<TipoMovimentacaoEstoque>('ENTRADA');
  protected readonly formularioVisivel = signal(false);
  protected readonly movimentacaoVisivel = signal(false);

  protected readonly pecasCriticas = computed(() =>
    this.pecas().filter((peca) => peca.quantidade <= peca.quantidadeMinima),
  );

  protected readonly valorEmEstoque = computed(() =>
    this.pecas().reduce((total, peca) => total + peca.quantidade * peca.precoUnitario, 0),
  );

  protected readonly formulario = this.formBuilder.nonNullable.group({
    codigo: ['', Validators.required],
    nome: ['', [Validators.required, Validators.minLength(3)]],
    marca: ['', Validators.required],
    quantidade: [0, [Validators.required, Validators.min(0)]],
    quantidadeMinima: [1, [Validators.required, Validators.min(0)]],
    precoUnitario: [0, [Validators.required, Validators.min(0)]],
  });

  protected readonly formularioMovimentacao = this.formBuilder.nonNullable.group({
    quantidade: [1, [Validators.required, Validators.min(1)]],
    observacao: [''],
  });

  constructor() {
    this.carregarPecas();
  }

  /** Carrega o estoque completo de peças. */
  protected carregarPecas(): void {
    this.carregando.set(true);
    this.pecaService.listarPecas().subscribe({
      next: (pecas) => {
        this.pecas.set(pecas);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Falha ao carregar o estoque',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  protected abrirCadastro(): void {
    this.pecaEmEdicao.set(null);
    this.formulario.reset({
      codigo: '',
      nome: '',
      marca: '',
      quantidade: 0,
      quantidadeMinima: 1,
      precoUnitario: 0,
    });
    this.formularioVisivel.set(true);
  }

  protected abrirEdicao(peca: Peca): void {
    this.pecaEmEdicao.set(peca);
    this.formulario.patchValue(peca);
    this.formularioVisivel.set(true);
  }

  /** Cadastra ou atualiza uma peça do estoque. */
  protected salvarPeca(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const dados = this.formulario.getRawValue();
    const emEdicao = this.pecaEmEdicao();

    const requisicao = emEdicao
      ? this.pecaService.atualizarPeca(emEdicao.id, dados)
      : this.pecaService.cadastrarPeca(dados);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.formularioVisivel.set(false);
        this.notificacaoService.sucesso(
          emEdicao ? 'Peça atualizada' : 'Peça cadastrada',
          `${dados.nome} · ${dados.marca}`,
        );
        this.carregarPecas();
      },
      error: (erro) => {
        this.salvando.set(false);
        this.notificacaoService.erro(
          'Não foi possível salvar',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  /** Abre o formulário de entrada ou saída manual de estoque. */
  protected abrirMovimentacao(peca: Peca, tipo: TipoMovimentacaoEstoque): void {
    this.pecaMovimentada.set(peca);
    this.tipoMovimentacao.set(tipo);
    this.formularioMovimentacao.reset({ quantidade: 1, observacao: '' });
    this.movimentacaoVisivel.set(true);
  }

  /** Registra a movimentação e avisa quando a peça fica em nível crítico. */
  protected registrarMovimentacao(): void {
    const peca = this.pecaMovimentada();
    if (!peca || this.formularioMovimentacao.invalid) {
      this.formularioMovimentacao.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const { quantidade, observacao } = this.formularioMovimentacao.getRawValue();
    const entrada = this.tipoMovimentacao() === 'ENTRADA';

    const requisicao = entrada
      ? this.pecaService.registrarEntrada(peca.id, quantidade, observacao)
      : this.pecaService.registrarSaida(peca.id, quantidade, observacao);

    requisicao.subscribe({
      next: (pecaAtualizada) => {
        this.salvando.set(false);
        this.movimentacaoVisivel.set(false);
        this.notificacaoService.sucesso(
          entrada ? 'Entrada registrada' : 'Saída registrada',
          `${pecaAtualizada.nome}: ${pecaAtualizada.quantidade} un. em estoque`,
        );
        if (pecaAtualizada.quantidade <= pecaAtualizada.quantidadeMinima) {
          this.notificacaoService.alerta(
            'Estoque baixo',
            `${pecaAtualizada.nome} — ${pecaAtualizada.quantidade} unidade(s)`,
          );
        }
        this.carregarPecas();
      },
      error: (erro) => {
        this.salvando.set(false);
        this.notificacaoService.erro(
          'Não foi possível movimentar',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  protected confirmarExclusao(peca: Peca): void {
    this.confirmacaoService.confirm({
      header: 'Excluir peça',
      message: `Excluir ${peca.nome} do estoque?`,
      icon: 'fa-solid fa-triangle-exclamation',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluirPeca(peca),
    });
  }

  private excluirPeca(peca: Peca): void {
    this.pecaService.excluirPeca(peca.id).subscribe({
      next: () => {
        this.notificacaoService.sucesso('Peça excluída', peca.nome);
        this.carregarPecas();
      },
      error: (erro) =>
        this.notificacaoService.erro(
          'Não foi possível excluir',
          this.notificacaoService.extrairMensagemErro(erro),
        ),
    });
  }

  protected estoqueCritico(peca: Peca): boolean {
    return peca.quantidade <= peca.quantidadeMinima;
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
}
