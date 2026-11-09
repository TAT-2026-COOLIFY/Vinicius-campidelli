import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacaoService } from '../services/autenticacao.service';

/** Impede o acesso as telas internas sem uma sessao ativa */
export const autenticacaoGuarda: CanActivateFn = () => {
  const autenticacaoService = inject(AutenticacaoService);
  const roteador = inject(Router);

  if (autenticacaoService.estaAutenticado()) return true;

  roteador.navigate(['/entrar']);
  return false;
};
