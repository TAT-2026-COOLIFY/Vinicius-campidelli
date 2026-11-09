import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import { ItemOrdemPayload, OrdemServico, OrdemServicoPayload, StatusOrdem } from '../modelos';

@Injectable({ providedIn: 'root' })
export class OrdemServicoService {
  private readonly http = inject(HttpClient);
  private readonly urlBase = `${AMBIENTE.urlApi}/ordens-servico`;

  listarOrdens(status?: StatusOrdem): Observable<OrdemServico[]> {
    const parametros = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<OrdemServico[]>(this.urlBase, { params: parametros });
  }

  buscarOrdemPorId(id: number): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.urlBase}/${id}`);
  }

  criarOrdem(dados: OrdemServicoPayload): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.urlBase, dados);
  }

  alterarStatusOrdem(id: number, status: StatusOrdem): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.urlBase}/${id}/status`, { status });
  }

  cancelarOrdem(id: number): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.urlBase}/${id}/cancelar`, {});
  }

  adicionarItem(id: number, dados: ItemOrdemPayload): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(`${this.urlBase}/${id}/itens`, dados);
  }

  removerItem(id: number, itemId: number): Observable<OrdemServico> {
    return this.http.delete<OrdemServico>(`${this.urlBase}/${id}/itens/${itemId}`);
  }
}
