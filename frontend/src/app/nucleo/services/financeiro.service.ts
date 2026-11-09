import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import {
  FaturamentoDiario,
  MovimentacaoFinanceira,
  MovimentacaoPayload,
  ResumoFinanceiro,
} from '../modelos';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${AMBIENTE.urlApi}/financeiro`;

  listarMovimentacoes(): Observable<MovimentacaoFinanceira[]> {
    return this.http.get<MovimentacaoFinanceira[]>(`${this.urlBase}/movimentacoes`);
  }

  obterResumoFinanceiro(): Observable<ResumoFinanceiro> {
    return this.http.get<ResumoFinanceiro>(`${this.urlBase}/resumo`);
  }

  obterFaturamentoPorDia(): Observable<FaturamentoDiario[]> {
    return this.http.get<FaturamentoDiario[]>(`${this.urlBase}/faturamento-por-dia`);
  }

  registrarMovimentacao(dados: MovimentacaoPayload): Observable<MovimentacaoFinanceira> {
    return this.http.post<MovimentacaoFinanceira>(`${this.urlBase}/movimentacoes`, dados);
  }

  excluirMovimentacao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/movimentacoes/${id}`);
  }
}
