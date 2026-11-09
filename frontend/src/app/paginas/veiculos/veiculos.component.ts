import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderPageComponent } from '../../compartilhado/componentes/header-page/header-page.component';
import { EstadoVazioComponent } from '../../compartilhado/componentes/estado-vazio/estado-vazio.component';
import { Cliente, Veiculo } from '../../nucleo/modelos';
import { ClienteService } from '../../nucleo/services/cliente.service';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';
import { VeiculoService } from '../../nucleo/services/veiculo.service';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    DialogModule,
    DropdownModule,
    TableModule,
    TooltipModule,
    HeaderPageComponent,
    EstadoVazioComponent,
  ],
  templateUrl: './veiculos.component.html',
})
export class VeiculosComponent {
  private readonly veiculoService = inject(VeiculoService);
  private readonly clienteService = inject(ClienteService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly confirmacaoService = inject(ConfirmationService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly veiculos = signal<Veiculo[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly veiculoEmEdicao = signal<Veiculo | null>(null);
  protected readonly formularioVisivel = signal(false);
  protected readonly anoAtual = new Date().getFullYear();

  protected readonly formulario = this.formBuilder.nonNullable.group({
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    placa: ['', [Validators.required, Validators.minLength(7)]],
    ano: [this.anoAtual, [Validators.required, Validators.min(1950)]],
    cor: [''],
    quilometragem: [0, [Validators.required, Validators.min(0)]],
    clienteId: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.carregarVeiculos();
    this.carregarClientes();
  }

  /** Busca a listagem de veículos com o proprietário já resolvido. */
  protected carregarVeiculos(): void {
    this.carregando.set(true);
    this.veiculoService.listarVeiculos().subscribe({
      next: (veiculos) => {
        this.veiculos.set(veiculos);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Falha ao carregar veículos',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  private carregarClientes(): void {
    this.clienteService.listarClientes().subscribe({
      next: (clientes) => this.clientes.set(clientes),
      error: () => this.clientes.set([]),
    });
  }

  protected abrirCadastro(): void {
    this.veiculoEmEdicao.set(null);
    this.formulario.reset({
      marca: '',
      modelo: '',
      placa: '',
      ano: this.anoAtual,
      cor: '',
      quilometragem: 0,
      clienteId: 0,
    });
    this.formularioVisivel.set(true);
  }

  protected abrirEdicao(veiculo: Veiculo): void {
    this.veiculoEmEdicao.set(veiculo);
    this.formulario.patchValue(veiculo);
    this.formularioVisivel.set(true);
  }

  /** Cadastra ou atualiza o veículo selecionado. */
  protected salvarVeiculo(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const dados = this.formulario.getRawValue();
    const emEdicao = this.veiculoEmEdicao();

    const requisicao = emEdicao
      ? this.veiculoService.atualizarVeiculo(emEdicao.id, dados)
      : this.veiculoService.cadastrarVeiculo(dados);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.formularioVisivel.set(false);
        this.notificacaoService.sucesso(
          emEdicao ? 'Veículo atualizado' : 'Veículo cadastrado',
          `${dados.marca} ${dados.modelo} · ${dados.placa.toUpperCase()}`,
        );
        this.carregarVeiculos();
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

  protected confirmarExclusao(veiculo: Veiculo): void {
    this.confirmacaoService.confirm({
      header: 'Excluir veículo',
      message: `Excluir o veículo de placa ${veiculo.placa}? Esta ação não pode ser desfeita.`,
      icon: 'fa-solid fa-triangle-exclamation',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.excluirVeiculo(veiculo),
    });
  }

  private excluirVeiculo(veiculo: Veiculo): void {
    this.veiculoService.excluirVeiculo(veiculo.id).subscribe({
      next: () => {
        this.notificacaoService.sucesso('Veículo excluído', `${veiculo.placa} foi removido.`);
        this.carregarVeiculos();
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

  protected filtrarTabela(
    tabela: { filterGlobal: (valor: string, modo: string) => void },
    evento: Event,
  ): void {
    tabela.filterGlobal((evento.target as HTMLInputElement).value, 'contains');
  }
}
