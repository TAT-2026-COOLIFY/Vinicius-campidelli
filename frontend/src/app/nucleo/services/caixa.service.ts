import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import { Caixa, MovimentacaoFinanceira } from '../modelos';

@Injectable({ providedIn: 'root' })
export class CaixaService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${AMBIENTE.urlApi}/caixa`;

  listarCaixas(): Observable<Caixa[]> {
    return this.http.get<Caixa[]>(this.urlBase);
  }

  obterCaixaDoDia(): Observable<Caixa> {
    return this.http.get<Caixa>(`${this.urlBase}/hoje`);
  }

  listarMovimentacoesDoCaixa(data: string): Observable<MovimentacaoFinanceira[]> {
    return this.http.get<MovimentacaoFinanceira[]>(`${this.urlBase}/movimentacoes`, {
      params: new HttpParams().set('data', data),
    });
  }

  fecharCaixa(id: number): Observable<Caixa> {
    return this.http.patch<Caixa>(`${this.urlBase}/${id}/fechar`, {});
  }
}
