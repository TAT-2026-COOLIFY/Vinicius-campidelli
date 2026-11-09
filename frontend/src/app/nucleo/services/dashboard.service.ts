import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AMBIENTE } from '../configuracao/ambiente';
import { VisaoGeralDashboard } from '../modelos';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  obterVisaoGeral(): Observable<VisaoGeralDashboard> {
    return this.http.get<VisaoGeralDashboard>(`${AMBIENTE.urlApi}/dashboard`);
  }
}
