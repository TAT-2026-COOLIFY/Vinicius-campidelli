import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
import { HeaderPageComponent } from '../../compartilhado/componentes/header-page/header-page.component';
import { AMBIENTE } from '../../nucleo/configuracao/ambiente';
import { AutenticacaoService } from '../../nucleo/services/autenticacao.service';
import { ConfiguracaoService } from '../../nucleo/services/configuracao.service';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [ReactiveFormsModule, InputSwitchModule, HeaderPageComponent],
  templateUrl: './configuracoes.component.html',
})
export class ConfiguracoesComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly configuracaoService = inject(ConfiguracaoService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly roteador = inject(Router);

  protected readonly usuario = this.autenticacaoService.usuarioLogado;
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);

  protected readonly formularioEmpresa = this.formBuilder.nonNullable.group({
    nomeFantasia: [AMBIENTE.nomeEmpresa, [Validators.required]],
    cnpj: ['', Validators.required],
    telefone: ['', Validators.required],
    endereco: ['', Validators.required],
    horarioAbertura: ['08:00', Validators.required],
    horarioFechamento: ['18:00', Validators.required],
  });

  protected readonly formularioPreferencias = this.formBuilder.nonNullable.group({
    avisoEstoqueMinimo: [true],
  });

  constructor() {
    this.carregarConfiguracao();
  }

  /** Busca a configuracao atual da oficina e preenche os formularios. */
  protected carregarConfiguracao(): void {
    this.carregando.set(true);
    this.configuracaoService.obterConfiguracao().subscribe({
      next: (configuracao) => {
        this.formularioEmpresa.patchValue(configuracao);
        this.formularioPreferencias.patchValue(configuracao);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.notificacaoService.erro(
          'Falha ao carregar as configurações',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  /** Salva os dados cadastrais e as preferencias operacionais da oficina. */
  protected salvarEmpresa(): void {
    if (this.formularioEmpresa.invalid) {
      this.formularioEmpresa.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    const dados = { ...this.formularioEmpresa.getRawValue(), ...this.formularioPreferencias.getRawValue() };
    this.configuracaoService.atualizarConfiguracao(dados).subscribe({
      next: () => {
        this.salvando.set(false);
        this.notificacaoService.sucesso('Dados salvos', 'As informações da oficina foram atualizadas.');
      },
      error: (erro) => {
        this.salvando.set(false);
        this.notificacaoService.erro(
          'Falha ao salvar as configurações',
          this.notificacaoService.extrairMensagemErro(erro),
        );
      },
    });
  }

  protected sair(): void {
    this.autenticacaoService.sair();
    this.roteador.navigate(['/entrar']);
  }
}
