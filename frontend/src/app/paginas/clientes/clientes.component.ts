import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderPageComponent } from '../../compartilhado/componentes/header-page/header-page.component';
import { EstadoVazioComponent } from '../../compartilhado/componentes/estado-vazio/estado-vazio.component';
import { Cliente } from '../../nucleo/modelos';
import { ClienteService } from '../../nucleo/services/cliente.service';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    TableModule,
    TooltipModule,
    HeaderPageComponent,
    EstadoVazioComponent,
  ],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent {
  private readonly clienteService = inject(ClienteService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly confirmacaoService = inject(ConfirmationService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly clienteEmEdicao = signal<Cliente | null>(null);
  protected readonly clienteVisualizado = signal<Cliente | null>(null);
  protected readonly formularioVisivel = signal(false);
  protected readonly detalheVisivel = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    telefone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    endereco: ['', [Validators.required]],
    cidade: [''],
  });

  constructor() {
    this.carregarClientes();
  }

  /** Busca a listagem de clientes na API. */
  protected carregarClientes(): void {
    this.carregando.set(true);
    this.clienteService.listarClientes().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Falha ao carregar clientes',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  /** Abre o formulário em modo de cadastro. */
  protected abrirCadastro(): void {
    this.clienteEmEdicao.set(null);
    this.formulario.reset({ nome: '', telefone: '', email: '', endereco: '', cidade: '' });
    this.formularioVisivel.set(true);
  }

  /** Abre o formulário preenchido com os dados do cliente. */
  protected abrirEdicao(cliente: Cliente): void {
    this.clienteEmEdicao.set(cliente);
    this.formulario.patchValue(cliente);
    this.formularioVisivel.set(true);
  }

  /** Exibe os detalhes do cliente selecionado. */
  protected visualizarCliente(cliente: Cliente): void {
    this.clienteVisualizado.set(cliente);
    this.detalheVisivel.set(true);
  }

  /** Cadastra ou atualiza o cliente conforme o modo do formulário. */
  protected salvarCliente(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const dados = this.formulario.getRawValue();
    const emEdicao = this.clienteEmEdicao();

    const requisicao = emEdicao
      ? this.clienteService.atualizarCliente(emEdicao.id, dados)
      : this.clienteService.cadastrarCliente(dados);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.formularioVisivel.set(false);
        this.notificacaoService.sucesso(
          emEdicao ? 'Cliente atualizado' : 'Cliente cadastrado',
          `${dados.nome} foi salvo com sucesso.`,
        );
        this.carregarClientes();
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

  /** Pede confirmação antes de excluir o cliente. */
  protected confirmarExclusao(cliente: Cliente): void {
    this.confirmacaoService.confirm({
      header: 'Excluir cliente',
      message: `Excluir ${cliente.nome}? Esta ação não pode ser desfeita.`,
      icon: 'fa-solid fa-triangle-exclamation',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluirCliente(cliente),
    });
  }

  private excluirCliente(cliente: Cliente): void {
    this.clienteService.excluirCliente(cliente.id).subscribe({
      next: () => {
        this.notificacaoService.sucesso('Cliente excluído', `${cliente.nome} saiu da base.`);
        this.carregarClientes();
      },
      error: (erro) => {
        this.notificacaoService.erro(
          'Não foi possível excluir',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  protected campoInvalido(campo: string): boolean {
    const controle = this.formulario.get(campo);
    return !!controle && controle.invalid && controle.touched;
  }

  protected filtrarTabela(tabela: { filterGlobal: (valor: string, modo: string) => void }, evento: Event): void {
    tabela.filterGlobal((evento.target as HTMLInputElement).value, 'contains');
  }
}
