import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderPageComponent } from '../../compartilhado/componentes/header-page/header-page.component';
import { EstadoVazioComponent } from '../../compartilhado/componentes/estado-vazio/estado-vazio.component';
import { StatusComponent } from '../../compartilhado/componentes/status/status.component';
import { ROTULOS_SITUACAO_SERVICO, gerarOpcoes } from '../../compartilhado/utilitarios/rotulos';
import { Servico, SituacaoServico } from '../../nucleo/modelos';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';
import { ServicoService } from '../../nucleo/services/servico.service';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    DialogModule,
    DropdownModule,
    TableModule,
    TooltipModule,
    HeaderPageComponent,
    EstadoVazioComponent,
    StatusComponent,
  ],
  templateUrl: './servicos.component.html',
})
export class ServicosComponent {
  private readonly servicoService = inject(ServicoService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly confirmacaoService = inject(ConfirmationService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly SituacaoServico = SituacaoServico;
  protected readonly opcoesSituacao = gerarOpcoes(ROTULOS_SITUACAO_SERVICO);
  protected readonly servicos = signal<Servico[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly servicoEmEdicao = signal<Servico | null>(null);
  protected readonly formularioVisivel = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    descricao: ['', [Validators.required, Validators.minLength(4)]],
    preco: [0, [Validators.required, Validators.min(0)]],
    duracaoMinutos: [60, [Validators.required, Validators.min(15)]],
    situacao: [SituacaoServico.ATIVO, Validators.required],
  });

  constructor() {
    this.carregarServicos();
  }

  /** Busca o catálogo de serviços oferecidos pela oficina. */
  protected carregarServicos(): void {
    this.carregando.set(true);
    this.servicoService.listarServicos().subscribe({
      next: (servicos) => {
        this.servicos.set(servicos);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Falha ao carregar serviços',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  protected abrirCadastro(): void {
    this.servicoEmEdicao.set(null);
    this.formulario.reset({
      descricao: '',
      preco: 0,
      duracaoMinutos: 60,
      situacao: SituacaoServico.ATIVO,
    });
    this.formularioVisivel.set(true);
  }

  protected abrirEdicao(servico: Servico): void {
    this.servicoEmEdicao.set(servico);
    this.formulario.patchValue(servico);
    this.formularioVisivel.set(true);
  }

  /** Cadastra ou atualiza um serviço do catálogo. */
  protected salvarServico(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const dados = this.formulario.getRawValue();
    const emEdicao = this.servicoEmEdicao();

    const requisicao = emEdicao
      ? this.servicoService.atualizarServico(emEdicao.id, dados)
      : this.servicoService.cadastrarServico(dados);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.formularioVisivel.set(false);
        this.notificacaoService.sucesso(
          emEdicao ? 'Serviço atualizado' : 'Serviço cadastrado',
          dados.descricao,
        );
        this.carregarServicos();
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

  /** Ativa ou desativa um servico sem removê-lo do catálogo. */
  protected alternarSituacao(servico: Servico): void {
    const novaSituacao =
      servico.situacao === SituacaoServico.ATIVO ? SituacaoServico.INATIVO : SituacaoServico.ATIVO;

    this.servicoService.atualizarServico(servico.id, { ...servico, situacao: novaSituacao }).subscribe({
      next: () => {
        const mensagem = novaSituacao === SituacaoServico.ATIVO ? 'Serviço ativado' : 'Serviço desativado';
        this.notificacaoService.sucesso(mensagem, servico.descricao);
        this.carregarServicos();
      },
      error: (erro) =>
        this.notificacaoService.erro(
          'Não foi possível alterar a situação',
          this.notificacaoService.extrairMensagemErro(erro),
        ),
    });
  }

  protected confirmarExclusao(servico: Servico): void {
    this.confirmacaoService.confirm({
      header: 'Excluir serviço',
      message: `Excluir "${servico.descricao}" do catálogo?`,
      icon: 'fa-solid fa-triangle-exclamation',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluirServico(servico),
    });
  }

  private excluirServico(servico: Servico): void {
    this.servicoService.excluirServico(servico.id).subscribe({
      next: () => {
        this.notificacaoService.sucesso('Serviço excluído', servico.descricao);
        this.carregarServicos();
      },
      error: (erro) =>
        this.notificacaoService.erro(
          'Não foi possível excluir',
          this.notificacaoService.extrairMensagemErro(erro),
        ),
    });
  }

  protected campoInvalido(campo: string): boolean {
    const controle = this.formulario.get(campo);
    return !!controle && controle.invalid && controle.touched;
  }

  protected formatarDuracao(minutos: number): string {
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return resto ? `${horas}h${resto}` : `${horas}h`;
  }

  protected filtrarTabela(
    tabela: { filterGlobal: (valor: string, modo: string) => void },
    evento: Event,
  ): void {
    tabela.filterGlobal((evento.target as HTMLInputElement).value, 'contains');
  }
}
