import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AMBIENTE } from '../../nucleo/configuracao/ambiente';
import { AutenticacaoService } from '../../nucleo/services/autenticacao.service';
import { NotificacaoService } from '../../nucleo/services/notificacao.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, PasswordModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly roteador = inject(Router);

  protected readonly nomeEmpresa = AMBIENTE.nomeEmpresa;
  protected readonly carregando = signal(false);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    email: ['admin@autocenter.com.br', [Validators.required, Validators.email]],
    senha: ['autocenter', [Validators.required, Validators.minLength(4)]],
  });

  /** Valida o formulario e inicia a sessao. */
  protected acessar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    const { email, senha } = this.formulario.getRawValue();

    setTimeout(() => {
      const autenticado = this.autenticacaoService.entrar(email, senha);
      this.carregando.set(false);

      if (!autenticado) {
        this.notificacaoService.erro('Não foi possível entrar', 'Verifique o e-mail e a senha informados.');
        return;
      }
      this.roteador.navigate(['/dashboard']);
    }, 450);
  }

  protected campoInvalido(campo: 'email' | 'senha'): boolean {
    const controle = this.formulario.controls[campo];
    return controle.invalid && controle.touched;
  }
}
