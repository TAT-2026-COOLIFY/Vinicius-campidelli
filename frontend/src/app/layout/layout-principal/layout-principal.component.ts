import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BarraLateralComponent } from '../barra-lateral/barra-lateral.component';
import { HeaderComponent } from '../header/header.component';

/** Estrutura fixa da area autenticada: barra lateral + cabecalho + conteudo. */
@Component({
  selector: 'app-layout-principal',
  standalone: true,
  imports: [NgClass, RouterOutlet, BarraLateralComponent, HeaderComponent],
  templateUrl: './layout-principal.component.html',
})
export class LayoutPrincipalComponent {
  protected readonly barraRecolhida = signal(false);

  protected alternarRecolhimento(): void {
    this.barraRecolhida.update((valor) => !valor);
  }
}
