import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import { Veiculo, VeiculoPayload } from '../modelos';

@Injectable({ providedIn: 'root' })
export class VeiculoService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${AMBIENTE.urlApi}/veiculos`;

  listarVeiculos(clienteId?: number): Observable<Veiculo[]> {
    const parametros = clienteId ? new HttpParams().set('clienteId', clienteId) : undefined;
    return this.http.get<Veiculo[]>(this.urlBase, { params: parametros });
  }

  buscarVeiculoPorId(id: number): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.urlBase}/${id}`);
  }

  cadastrarVeiculo(dados: VeiculoPayload): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.urlBase, dados);
  }

  atualizarVeiculo(id: number, dados: VeiculoPayload): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.urlBase}/${id}`, dados);
  }

  excluirVeiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
}
