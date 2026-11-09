import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

/** Card de indicador utilizado no dashboard e nos modulos financeiros */
@Component({
  selector: 'app-card-dashboard',
  standalone: true,
  imports: [NgClass],
  templateUrl: './card-dashboard.component.html',
})
export class CardDashboardComponent {
  @Input({ required: true }) titulo = '';
  @Input({ required: true }) valor: string | null = '';
  @Input() icone = 'fa-solid fa-chart-bar';
  @Input() complemento: string | null = '';
  @Input() cor: 'marca' | 'sucesso' | 'atencao' | 'erro' | 'neutro' = 'marca';

  protected obterClassesIcone(): string {
    const mapa: Record<string, string> = {
      marca: 'bg-marca-50 text-marca-600',
      sucesso: 'bg-emerald-50 text-emerald-600',
      atencao: 'bg-amber-50 text-amber-600',
      erro: 'bg-rose-50 text-rose-600',
      neutro: 'bg-slate-100 text-slate-600',
    };
    return mapa[this.cor];
  }
}
