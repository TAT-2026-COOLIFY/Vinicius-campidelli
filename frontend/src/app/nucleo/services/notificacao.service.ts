import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Centraliza as mensagens de feedback da aplicacao (toasts).
 * Evita repetir a configuracao do MessageService em cada tela.
 */
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly mensagens = inject(MessageService);

  /** Confirma que uma operacao foi concluida. */
  sucesso(titulo: string, detalhe = ''): void {
    this.mensagens.add({ severity: 'success', summary: titulo, detail: detalhe, life: 3500 });
  }

  /** Comunica um erro, priorizando a mensagem devolvida pela API. */
  erro(titulo: string, detalhe = 'Tente novamente em instantes.'): void {
    this.mensagens.add({ severity: 'error', summary: titulo, detail: detalhe, life: 5000 });
  }

  /** Alerta sobre situacoes que exigem atencao, como estoque baixo. */
  alerta(titulo: string, detalhe = ''): void {
    this.mensagens.add({ severity: 'warn', summary: titulo, detail: detalhe, life: 4500 });
  }

  /** Informa algo neutro ao usuario. */
  informacao(titulo: string, detalhe = ''): void {
    this.mensagens.add({ severity: 'info', summary: titulo, detail: detalhe, life: 3500 });
  }

  /** Extrai a mensagem de erro devolvida pelo backend NestJS. */
  extrairMensagemErro(erro: unknown): string {
    const resposta = (erro as { error?: { message?: string | string[] } })?.error;
    if (!resposta?.message) return 'Nao foi possivel concluir a operacao.';
    return Array.isArray(resposta.message) ? resposta.message.join(' ') : resposta.message;
  }
}
