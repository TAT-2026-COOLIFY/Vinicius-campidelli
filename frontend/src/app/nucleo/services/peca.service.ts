import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import { Peca, PecaPayload } from '../modelos';

@Injectable({ providedIn: 'root' })
export class PecaService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${AMBIENTE.urlApi}/pecas`;

  listarPecas(): Observable<Peca[]> {
    return this.http.get<Peca[]>(this.urlBase);
  }

  listarPecasComEstoqueBaixo(): Observable<Peca[]> {
    return this.http.get<Peca[]>(`${this.urlBase}/estoque-baixo`);
  }

  cadastrarPeca(dados: PecaPayload): Observable<Peca> {
    return this.http.post<Peca>(this.urlBase, dados);
  }

  atualizarPeca(id: number, dados: PecaPayload): Observable<Peca> {
    return this.http.put<Peca>(`${this.urlBase}/${id}`, dados);
  }

  registrarEntrada(id: number, quantidade: number, observacao = ''): Observable<Peca> {
    return this.http.patch<Peca>(`${this.urlBase}/${id}/entrada`, { quantidade, observacao });
  }

  registrarSaida(id: number, quantidade: number, observacao = ''): Observable<Peca> {
    return this.http.patch<Peca>(`${this.urlBase}/${id}/saida`, { quantidade, observacao });
  }

  excluirPeca(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
