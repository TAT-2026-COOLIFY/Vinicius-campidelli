import { Component, Input } from '@angular/core';

/** Mensagem exibida quando uma listagem está nulo */
@Component({
  selector: 'app-estado-vazio',
  standalone: true,
  templateUrl: './estado-vazio.component.html',
})
export class EstadoVazioComponent {
  @Input() icone = 'fa-solid fa-inbox';
  @Input({ required: true }) titulo = '';
  @Input() mensagem = '';
}
