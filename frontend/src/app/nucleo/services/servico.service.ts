import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import { Servico, ServicoPayload } from '../modelos';

@Injectable({ providedIn: 'root' })
export class ServicoService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${AMBIENTE.urlApi}/servicos`;

  listarServicos(): Observable<Servico[]> {
    return this.http.get<Servico[]>(this.urlBase);
  }

  cadastrarServico(dados: ServicoPayload): Observable<Servico> {
    return this.http.post<Servico>(this.urlBase, dados);
  }

  atualizarServico(id: number, dados: ServicoPayload): Observable<Servico> {
    return this.http.put<Servico>(`${this.urlBase}/${id}`, dados);
  }

  excluirServico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
