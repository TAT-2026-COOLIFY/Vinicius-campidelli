import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import { Cliente, ClientePayload } from '../modelos';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${AMBIENTE.urlApi}/clientes`;

  listarClientes(busca?: string): Observable<Cliente[]> {
    const parametros = busca ? new HttpParams().set('busca', busca) : undefined;
    return this.http.get<Cliente[]>(this.urlBase, { params: parametros });
  }

  buscarClientePorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlBase}/${id}`);
  }

  cadastrarCliente(dados: ClientePayload): Observable<Cliente> {
    return this.http.post<Cliente>(this.urlBase, dados);
  }

  atualizarCliente(id: number, dados: ClientePayload): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.urlBase}/${id}`, dados);
  }

  excluirCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
