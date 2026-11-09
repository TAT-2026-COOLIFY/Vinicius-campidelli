import { Injectable, computed, signal } from '@angular/core';

/** Usuario autenticado na plataforma. */
export interface UsuarioLogado {
  nome: string;
  cargo: string;
  email: string;
  iniciais: string;
}

const CHAVE_SESSAO = 'autocenter.usuario';

/**
 * Autenticacao simplificada para fins academicos.
 * Em producao, o token viria da API e seria validado a cada requisicao.
 */
@Injectable({ providedIn: 'root' })
export class AutenticacaoService {
  private readonly usuario = signal<UsuarioLogado | null>(this.recuperarSessao());

  readonly usuarioLogado = computed(() => this.usuario());
  readonly estaAutenticado = computed(() => this.usuario() !== null);

  /** Valida as credenciais e inicia a sessao. */
  entrar(email: string, senha: string): boolean {
    if (!email || senha.length < 4) return false;

    const nome = 'Vinicius Campidelli';
    const usuario: UsuarioLogado = {
      nome,
      cargo: 'Administrador',
      email,
      iniciais: this.gerarIniciais(nome),
    };
    this.usuario.set(usuario);
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
    return true;
  }

  /** Encerra a sessao do usuario. */
  sair(): void {
    this.usuario.set(null);
    localStorage.removeItem(CHAVE_SESSAO);
  }

  private gerarIniciais(nome: string): string {
    return nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase();
  }

  private recuperarSessao(): UsuarioLogado | null {
    const armazenado = localStorage.getItem(CHAVE_SESSAO);
    return armazenado ? (JSON.parse(armazenado) as UsuarioLogado) : null;
  }
}
