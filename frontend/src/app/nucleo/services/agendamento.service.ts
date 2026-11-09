import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import { Agendamento, AgendamentoPayload, SituacaoAgendamento } from '../modelos';

@Injectable({ providedIn: 'root' })
export class AgendamentoService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${AMBIENTE.urlApi}/agendamentos`;

  listarAgendamentos(data?: string): Observable<Agendamento[]> {
    const parametros = data ? new HttpParams().set('data', data) : undefined;
    return this.http.get<Agendamento[]>(this.urlBase, { params: parametros });
  }

  listarHorariosLivres(data: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.urlBase}/horarios-livres`, {
      params: new HttpParams().set('data', data),
    });
  }

  agendarServico(dados: AgendamentoPayload): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.urlBase, dados);
  }

  atualizarAgendamento(id: number, dados: AgendamentoPayload): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.urlBase}/${id}`, dados);
  }

  alterarSituacaoAgendamento(id: number, situacao: SituacaoAgendamento): Observable<Agendamento> {
    return this.http.patch<Agendamento>(`${this.urlBase}/${id}/situacao`, { situacao });
  }

  cancelarAgendamento(id: number): Observable<Agendamento> {
    return this.http.patch<Agendamento>(`${this.urlBase}/${id}/cancelar`, {});
  }

  excluirAgendamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
