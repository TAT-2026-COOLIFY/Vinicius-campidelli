import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, Input, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { EstadoVazioComponent } from '../../../compartilhado/componentes/estado-vazio/estado-vazio.component';
import { StatusComponent } from '../../../compartilhado/componentes/status/status.component';
import {
  ROTULOS_STATUS_ORDEM,
  descreverTipoItem,
} from '../../../compartilhado/utilitarios/rotulos';
import {
  OrdemServico,
  Peca,
  Servico,
  SituacaoServico,
  StatusOrdem,
  TipoItemOrdem,
} from '../../../nucleo/modelos';
import { NotificacaoService } from '../../../nucleo/services/notificacao.service';
import { OrdemServicoService } from '../../../nucleo/services/ordem-servico.service';
import { PecaService } from '../../../nucleo/services/peca.service';
import { ServicoService } from '../../../nucleo/services/servico.service';

/** Etapa da esteira de acompanhamento exibida no topo da ordem. */
interface EtapaOrdem {
  status: StatusOrdem;
  rotulo: string;
  concluida: boolean;
  atual: boolean;
}

/** Sequência natural de execução de uma ordem. */
const FLUXO_ORDEM: StatusOrdem[] = [
  StatusOrdem.ABERTA,
  StatusOrdem.AGUARDANDO_ATENDIMENTO,
  StatusOrdem.EM_ANDAMENTO,
  StatusOrdem.CONCLUIDA,
];

@Component({
  selector: 'app-detalhe-ordem',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgClass,
    RouterLink,
    ReactiveFormsModule,
    DialogModule,
    DropdownModule,
    RadioButtonModule,
    TableModule,
    TooltipModule,
    EstadoVazioComponent,
    StatusComponent,
  ],
  templateUrl: './detalhe-ordem.component.html',
})
export class DetalheOrdemComponent {
  private readonly ordemServicoService = inject(OrdemServicoService);
  private readonly servicoService = inject(ServicoService);
  private readonly pecaService = inject(PecaService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly confirmacaoService = inject(ConfirmationService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly ordem = signal<OrdemServico | null>(null);
  protected readonly servicos = signal<Servico[]>([]);
  protected readonly pecas = signal<Peca[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvandoItem = signal(false);
  protected readonly itemVisivel = signal(false);
  protected readonly descreverTipoItem = descreverTipoItem;
  protected readonly tipoItem = TipoItemOrdem;

  protected readonly opcoesStatus = FLUXO_ORDEM.concat([
    StatusOrdem.AGUARDANDO_PECAS,
  ]).map((status) => ({ rotulo: ROTULOS_STATUS_ORDEM[status].rotulo, valor: status }));

  protected readonly formularioItem = this.formBuilder.nonNullable.group({
    tipo: [TipoItemOrdem.SERVICO, Validators.required],
    referenciaId: [0, [Validators.required, Validators.min(1)]],
    quantidade: [1, [Validators.required, Validators.min(1)]],
  });

  /** Esteira de status: mostra em que ponto do fluxo a ordem está. */
  protected readonly etapas = computed<EtapaOrdem[]>(() => {
    const ordem = this.ordem();
    if (!ordem) return [];

    const indiceAtual = FLUXO_ORDEM.indexOf(ordem.status);
    return FLUXO_ORDEM.map((status, indice) => ({
      status,
      rotulo: ROTULOS_STATUS_ORDEM[status].rotulo,
      concluida: indiceAtual > indice && indiceAtual !== -1,
      atual: status === ordem.status,
    }));
  });

  /** Catálogo disponível conforme o tipo de item escolhido. */
  protected readonly opcoesItem = computed(() => {
    const tipo = this.tipoSelecionado();
    if (tipo === TipoItemOrdem.PECA) {
      return this.pecas().map((peca) => ({
        id: peca.id,
        rotulo: peca.nome,
        detalhe: `${peca.marca} · ${peca.quantidade} un. em estoque`,
        valor: peca.precoUnitario,
        indisponivel: peca.quantidade <= 0,
      }));
    }
    return this.servicos().map((servico) => ({
      id: servico.id,
      rotulo: servico.descricao,
      detalhe:
        servico.situacao === SituacaoServico.INATIVO
          ? 'Inativo'
          : `${servico.duracaoMinutos} min`,
      valor: servico.preco,
      indisponivel: servico.situacao === SituacaoServico.INATIVO,
    }));
  });

  /** Prévia do valor do item antes de confirmar a inclusão. */
  protected calcularPreviaItem(): number {
    const { referenciaId, quantidade } = this.formularioItem.getRawValue();
    const opcao = this.opcoesItem().find((item) => item.id === referenciaId);
    return opcao ? opcao.valor * quantidade : 0;
  }

  private readonly tipoSelecionado = signal<TipoItemOrdem>(TipoItemOrdem.SERVICO);
  private identificador = 0;

  /** Identificador da ordem recebido pela rota. */
  @Input() set id(valor: string) {
    this.identificador = Number(valor);
    this.carregarOrdem();
  }

  constructor() {
    this.servicoService.listarServicos().subscribe((servicos) => this.servicos.set(servicos));
    this.pecaService.listarPecas().subscribe((pecas) => this.pecas.set(pecas));

    this.formularioItem.controls.tipo.valueChanges.subscribe((tipo) => {
      this.tipoSelecionado.set(tipo);
      this.formularioItem.controls.referenciaId.setValue(0);
    });
  }

  /** Busca a ordem e seus itens. */
  protected carregarOrdem(): void {
    this.carregando.set(true);
    this.ordemServicoService.buscarOrdemPorId(this.identificador).subscribe({
      next: (ordem) => {
        this.ordem.set(ordem);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Ordem não encontrada',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  protected abrirInclusaoItem(): void {
    this.formularioItem.reset({
      tipo: TipoItemOrdem.SERVICO,
      referenciaId: 0,
      quantidade: 1,
    });
    this.tipoSelecionado.set(TipoItemOrdem.SERVICO);
    this.itemVisivel.set(true);
  }

  /** Lança um serviço ou peça na ordem, atualizando o total automaticamente. */
  protected adicionarItem(): void {
    if (this.formularioItem.invalid) {
      this.formularioItem.markAllAsTouched();
      return;
    }

    this.salvandoItem.set(true);
    this.ordemServicoService
      .adicionarItem(this.identificador, this.formularioItem.getRawValue())
      .subscribe({
        next: (ordem) => {
          this.salvandoItem.set(false);
          this.itemVisivel.set(false);
          this.ordem.set(ordem);
          this.notificacaoService.sucesso(
            'Item adicionado',
            `Total da ordem: ${this.formatarMoeda(ordem.valorTotal)}`,
          );
          this.pecaService.listarPecas().subscribe((pecas) => this.pecas.set(pecas));
        },
        error: (erro) => {
          this.salvandoItem.set(false);
          this.notificacaoService.erro(
            'Não foi possível adicionar o item',
            this.notificacaoService.extrairMensagemErro(erro),
          );
        },
      });
  }

  /** Remove um item e devolve peças ao estoque. */
  protected removerItem(itemId: number, nome: string): void {
    this.confirmacaoService.confirm({
      header: 'Remover item',
      message: `Remover "${nome}" da ordem? As peças voltam para o estoque.`,
      icon: 'fa-solid fa-triangle-exclamation',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.ordemServicoService.removerItem(this.identificador, itemId).subscribe({
          next: (ordem) => {
            this.ordem.set(ordem);
            this.notificacaoService.sucesso('Item removido', nome);
            this.pecaService.listarPecas().subscribe((pecas) => this.pecas.set(pecas));
          },
          error: (erro) =>
            this.notificacaoService.erro(
              'Não foi possível remover',
              this.notificacaoService.extrairMensagemErro(erro),
            ),
        });
      },
    });
  }

  /** Atualiza o status da ordem no fluxo de atendimento. */
  protected alterarStatus(status: StatusOrdem): void {
    this.ordemServicoService.alterarStatusOrdem(this.identificador, status).subscribe({
      next: (ordem) => {
        this.ordem.set(ordem);
        this.notificacaoService.sucesso(
          'Status atualizado',
          `${ordem.numero} · ${ROTULOS_STATUS_ORDEM[ordem.status].rotulo}`,
        );
      },
      error: (erro) =>
        this.notificacaoService.erro(
          'Não foi possível atualizar',
          this.notificacaoService.extrairMensagemErro(erro),
        ),
    });
  }

  protected confirmarCancelamento(): void {
    this.confirmacaoService.confirm({
      header: 'Cancelar ordem',
      message: 'Cancelar esta ordem? As peças utilizadas retornam ao estoque.',
      icon: 'fa-solid fa-triangle-exclamation',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.ordemServicoService.cancelarOrdem(this.identificador).subscribe({
          next: (ordem) => {
            this.ordem.set(ordem);
            this.notificacaoService.informacao('Ordem cancelada', ordem.numero);
          },
          error: (erro) =>
            this.notificacaoService.erro(
              'Não foi possível cancelar',
              this.notificacaoService.extrairMensagemErro(erro),
            ),
        });
      },
    });
  }

  /** Conclui a ordem e gera o lançamento financeiro correspondente. */
  protected concluirOrdem(): void {
    this.confirmacaoService.confirm({
      header: 'Concluir ordem',
      message: 'Concluir a ordem e registrar o recebimento no financeiro?',
      icon: 'fa-solid fa-circle-check',
      accept: () => this.alterarStatus(StatusOrdem.CONCLUIDA),
    });
  }

  /** Formata um valor no padrão monetário brasileiro. */
  protected formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  protected ordemFinalizada(): boolean {
    const status = this.ordem()?.status;
    return status === StatusOrdem.CONCLUIDA || status === StatusOrdem.CANCELADA;
  }
}
