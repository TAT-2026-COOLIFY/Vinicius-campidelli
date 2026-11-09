import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import { Configuracao, ConfiguracaoPayload } from '../modelos';

@Injectable({ providedIn: 'root' })
export class ConfiguracaoService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${AMBIENTE.urlApi}/configuracoes`;

  /** Emite a configuracao sempre que ela e atualizada, para a UI reagir sem recarregar a pagina. */
  private readonly configuracaoAtualizada = new Subject<Configuracao>();
  readonly configuracaoAtualizada$ = this.configuracaoAtualizada.asObservable();

  obterConfiguracao(): Observable<Configuracao> {
    return this.http.get<Configuracao>(this.urlBase);
  }

  atualizarConfiguracao(dados: ConfiguracaoPayload): Observable<Configuracao> {
    return this.http
      .put<Configuracao>(this.urlBase, dados)
      .pipe(tap((configuracao) => this.configuracaoAtualizada.next(configuracao)));
  }
}
