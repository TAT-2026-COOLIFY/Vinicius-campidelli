import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderPageComponent } from '../../../compartilhado/componentes/header-page/header-page.component';
import { EstadoVazioComponent } from '../../../compartilhado/componentes/estado-vazio/estado-vazio.component';
import { StatusComponent } from '../../../compartilhado/componentes/status/status.component';
import { ROTULOS_STATUS_ORDEM } from '../../../compartilhado/utilitarios/rotulos';
import { Cliente, OrdemServico, StatusOrdem, Veiculo } from '../../../nucleo/modelos';
import { ClienteService } from '../../../nucleo/services/cliente.service';
import { NotificacaoService } from '../../../nucleo/services/notificacao.service';
import { OrdemServicoService } from '../../../nucleo/services/ordem-servico.service';
import { VeiculoService } from '../../../nucleo/services/veiculo.service';

@Component({
  selector: 'app-lista-ordens',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    DialogModule,
    DropdownModule,
    TableModule,
    TooltipModule,
    HeaderPageComponent,
    EstadoVazioComponent,
    StatusComponent,
  ],
  templateUrl: './lista-ordens.component.html',
})
export class ListaOrdensComponent {
  private readonly ordemServicoService = inject(OrdemServicoService);
  private readonly clienteService = inject(ClienteService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly roteador = inject(Router);

  protected readonly ordens = signal<OrdemServico[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly veiculos = signal<Veiculo[]>([]);
  protected readonly veiculosDoCliente = signal<Veiculo[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly formularioVisivel = signal(false);
  protected readonly statusSelecionado = signal<StatusOrdem | null>(null);

  /** Abas de filtro rápido por status, com a contagem de cada situação. */
  protected readonly filtros = computed(() => {
    const todas = this.ordens();
    const statusDisponiveis = Object.values(StatusOrdem);
    return [
      { rotulo: 'Todas', status: null as StatusOrdem | null, quantidade: todas.length },
      ...statusDisponiveis.map((status) => ({
        rotulo: ROTULOS_STATUS_ORDEM[status].rotulo,
        status: status as StatusOrdem | null,
        quantidade: todas.filter((ordem) => ordem.status === status).length,
      })),
    ];
  });

  protected readonly ordensFiltradas = computed(() => {
    const status = this.statusSelecionado();
    return status ? this.ordens().filter((ordem) => ordem.status === status) : this.ordens();
  });

  protected readonly formulario = this.formBuilder.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    veiculoId: [0, [Validators.required, Validators.min(1)]],
    observacoes: [''],
  });

  constructor() {
    this.carregarOrdens();
    this.carregarApoio();

    this.formulario.controls.clienteId.valueChanges.subscribe((clienteId) => {
      this.veiculosDoCliente.set(this.veiculos().filter((veiculo) => veiculo.clienteId === clienteId));
      this.formulario.controls.veiculoId.setValue(0);
    });
  }

  /** Carrega todas as ordens de serviço da oficina. */
  protected carregarOrdens(): void {
    this.carregando.set(true);
    this.ordemServicoService.listarOrdens().subscribe({
      next: (ordens) => {
        this.ordens.set(ordens);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Falha ao carregar ordens',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  private carregarApoio(): void {
    this.clienteService.listarClientes().subscribe((clientes) => this.clientes.set(clientes));
    this.veiculoService.listarVeiculos().subscribe((veiculos) => this.veiculos.set(veiculos));
  }

  protected aplicarFiltro(status: StatusOrdem | null): void {
    this.statusSelecionado.set(status);
  }

  protected abrirNovaOrdem(): void {
    this.formulario.reset({ clienteId: 0, veiculoId: 0, observacoes: '' });
    this.formularioVisivel.set(true);
  }

  /** Abre a ordem e leva o usuário direto para a tela de detalhes. */
  protected criarOrdem(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.ordemServicoService.criarOrdem(this.formulario.getRawValue()).subscribe({
      next: (ordem) => {
        this.salvando.set(false);
        this.formularioVisivel.set(false);
        this.notificacaoService.sucesso('Ordem aberta', `${ordem.numero} · ${ordem.nomeCliente}`);
        this.roteador.navigate(['/ordens-servico', ordem.id]);
      },
      error: (erro) => {
        this.salvando.set(false);
        this.notificacaoService.erro(
          'Não foi possível abrir a ordem',
          this.notificacaoService.extrairMensagemErro(erro),
        );
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
}
