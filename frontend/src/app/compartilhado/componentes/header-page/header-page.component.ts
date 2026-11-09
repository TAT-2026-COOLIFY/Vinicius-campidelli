import { Component, Input } from '@angular/core';

/** Cabecalho padrao das paginas: titulo, descricao e area de acoes */
@Component({
  selector: 'app-header-page',
  standalone: true,
  templateUrl: './header-page.component.html',
})
export class HeaderPageComponent {
  @Input({ required: true }) titulo = '';
  @Input() descricao = '';
}
