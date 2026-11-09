import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { HeaderPageComponent } from '../../compartilhado/componentes/header-page/header-page.component';
import { EstadoVazioComponent } from '../../compartilhado/componentes/estado-vazio/estado-vazio.component';
import { StatusComponent } from '../../compartilhado/componentes/status/status.component';
import { ROTULOS_SITUACAO_AGENDAMENTO } from '../../compartilhado/utilitarios/rotulos';
import { Agendamento, Cliente, Servico, SituacaoAgendamento, Veiculo } from '../../nucleo/modelos';
import { AgendamentoService } from '../../nucleo/services/agendamento.service';
import { ClienteService } from '../../nucleo/services/cliente.service';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';
import { ServicoService } from '../../nucleo/services/servico.service';
import { VeiculoService } from '../../nucleo/services/veiculo.service';


const GRADE_HORARIOS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];


const FLUXO_AGENDAMENTO: SituacaoAgendamento[] = [
  SituacaoAgendamento.AGENDADO,
  SituacaoAgendamento.AGUARDANDO_PECA,
  SituacaoAgendamento.EM_ANDAMENTO,
  SituacaoAgendamento.CONCLUIDO,
];

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    DropdownModule,
    TableModule,
    TooltipModule,
    HeaderPageComponent,
    EstadoVazioComponent,
    StatusComponent,
  ],
  templateUrl: './agendamentos.component.html',
})
export class AgendamentosComponent {
  private readonly agendamentoService = inject(AgendamentoService);
  private readonly clienteService = inject(ClienteService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly servicoService = inject(ServicoService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly confirmacaoService = inject(ConfirmationService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly agendamentos = signal<Agendamento[]>([]);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly veiculos = signal<Veiculo[]>([]);
  protected readonly servicos = signal<Servico[]>([]);
  protected readonly horariosLivres = signal<string[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly formularioVisivel = signal(false);
  protected readonly gradeHorarios = GRADE_HORARIOS;

  protected readonly opcoesSituacao = FLUXO_AGENDAMENTO.map((situacao) => ({
    valor: situacao,
    rotulo: ROTULOS_SITUACAO_AGENDAMENTO[situacao].rotulo,
  }));

  protected readonly formulario = this.formBuilder.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    veiculoId: [0, [Validators.required, Validators.min(1)]],
    servicoId: [0, [Validators.required, Validators.min(1)]],
    data: [this.dataDeHoje(), Validators.required],
    horario: ['', Validators.required],
    observacao: [''],
  });

  /** Veículos do cliente escolhido no formulário */
  protected readonly veiculosDoCliente = signal<Veiculo[]>([]);

  /** Agenda do dia selecionado, usada na visão de grade de horários */
  protected readonly dataSelecionada = signal(this.dataDeHoje());

  protected readonly agendaDoDia = computed(() =>
    this.agendamentos().filter(
      (agendamento) =>
        agendamento.data === this.dataSelecionada() && agendamento.situacao !== SituacaoAgendamento.CANCELADO,
    ),
  );

  constructor() {
    this.carregarAgendamentos();
    this.carregarApoio();

    this.formulario.controls.clienteId.valueChanges.subscribe((clienteId) => {
      this.veiculosDoCliente.set(this.veiculos().filter((veiculo) => veiculo.clienteId === clienteId));
      this.formulario.controls.veiculoId.setValue(0);
    });

    this.formulario.controls.data.valueChanges.subscribe((data) => {
      if (data) this.consultarHorariosLivres(data);
    });
  }

  /** Carrega a agenda completa da oficina */
  protected carregarAgendamentos(): void {
    this.carregando.set(true);
    this.agendamentoService.listarAgendamentos().subscribe({
      next: (agendamentos) => {
        this.agendamentos.set(agendamentos);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Falha ao carregar a agenda',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  private carregarApoio(): void {
    this.clienteService.listarClientes().subscribe((clientes) => this.clientes.set(clientes));
    this.veiculoService.listarVeiculos().subscribe((veiculos) => this.veiculos.set(veiculos));
    this.servicoService.listarServicos().subscribe((servicos) => this.servicos.set(servicos));
  }

  /** Consulta quais horários seguem livres na data informada. */
  protected consultarHorariosLivres(data: string): void {
    this.agendamentoService.listarHorariosLivres(data).subscribe({
      next: (horarios) => this.horariosLivres.set(horarios),
      error: () => this.horariosLivres.set([]),
    });
  }

  protected abrirAgendamento(): void {
    this.formulario.reset({
      clienteId: 0,
      veiculoId: 0,
      servicoId: 0,
      data: this.dataSelecionada(),
      horario: '',
      observacao: '',
    });
    this.consultarHorariosLivres(this.dataSelecionada());
    this.formularioVisivel.set(true);
  }

  /** Confirma o agendamento, respeitando os horários já ocupados. */
  protected confirmarAgendamento(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.agendamentoService.agendarServico(this.formulario.getRawValue()).subscribe({
      next: (agendamento) => {
        this.salvando.set(false);
        this.formularioVisivel.set(false);
        this.notificacaoService.sucesso(
          'Serviço agendado',
          `${agendamento.nomeCliente} · ${this.formatarData(agendamento.data)} às ${agendamento.horario}`,
        );
        this.carregarAgendamentos();
      },
      error: (erro) => {
        this.salvando.set(false);
        this.notificacaoService.erro(
          'Horário indisponível',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  /** Avança ou retrocede a situação do agendamento no fluxo de atendimento */
  protected alterarSituacao(agendamento: Agendamento, situacao: SituacaoAgendamento): void {
    this.agendamentoService.alterarSituacaoAgendamento(agendamento.id, situacao).subscribe({
      next: () => this.carregarAgendamentos(),
      error: (erro) =>
        this.notificacaoService.erro(
          'Não foi possível atualizar',
          this.notificacaoService.extrairMensagemErro(erro),
        ),
    });
  }

  protected confirmarCancelamento(agendamento: Agendamento): void {
    this.confirmacaoService.confirm({
      header: 'Cancelar agendamento',
      message: `Cancelar o agendamento de ${agendamento.nomeCliente} em ${this.formatarData(agendamento.data)}?`,
      icon: 'fa-solid fa-triangle-exclamation',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.cancelarAgendamento(agendamento),
    });
  }

  private cancelarAgendamento(agendamento: Agendamento): void {
    this.agendamentoService.cancelarAgendamento(agendamento.id).subscribe({
      next: () => {
        this.notificacaoService.sucesso('Agendamento cancelado', 'O horário voltou a ficar livre.');
        this.carregarAgendamentos();
      },
      error: (erro) =>
        this.notificacaoService.erro(
          'Não foi possível cancelar',
          this.notificacaoService.extrairMensagemErro(erro),
        ),
    });
  }

  /** Retorna o agendamento que ocupa um horário na data selecionada. */
  protected agendamentoNoHorario(horario: string): Agendamento | undefined {
    return this.agendaDoDia().find((agendamento) => agendamento.horario === horario);
  }

  protected alterarDataSelecionada(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    if (valor) this.dataSelecionada.set(valor);
  }

  protected campoInvalido(campo: string): boolean {
    const controle = this.formulario.get(campo);
    return !!controle && controle.invalid && controle.touched;
  }

  protected formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  private dataDeHoje(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
