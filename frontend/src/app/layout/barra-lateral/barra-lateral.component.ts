import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { AMBIENTE } from '../../nucleo/configuracao/ambiente';
import { AutenticacaoService } from '../../nucleo/services/autenticacao.service';

/** Item de navegacao da barra lateral. */
interface ItemNavegacao {
  rotulo: string;
  icone: string;
  rota: string;
}

/** Agrupamento de itens por area do negocio. */
interface GrupoNavegacao {
  titulo: string;
  itens: ItemNavegacao[];
}

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive, MenuModule],
  templateUrl: './barra-lateral.component.html',
})
export class BarraLateralComponent {
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly roteador = inject(Router);

  /** Barra recolhida (somente icones) */
  @Input() recolhida = false;

  @Output() alternarRecolhimento = new EventEmitter<void>();

  protected readonly nomeEmpresa = AMBIENTE.nomeEmpresa;
  protected readonly usuario = this.autenticacaoService.usuarioLogado;

  protected readonly grupos: GrupoNavegacao[] = [
    {
      titulo: 'Operação',
      itens: [
        { rotulo: 'Dashboard', icone: 'fa-solid fa-sliders', rota: '/dashboard' },
        { rotulo: 'Ordens de Serviço', icone: 'fa-solid fa-file-pen', rota: '/ordens-servico' },
        { rotulo: 'Agendamentos', icone: 'fa-solid fa-calendar', rota: '/agendamentos' },
      ],
    },
    {
      titulo: 'Cadastros',
      itens: [
        { rotulo: 'Clientes', icone: 'fa-solid fa-users', rota: '/clientes' },
        { rotulo: 'Veículos', icone: 'fa-solid fa-car', rota: '/veiculos' },
        { rotulo: 'Serviços', icone: 'fa-solid fa-wrench', rota: '/servicos' },
      ],
    },
    {
      titulo: 'Estoque',
      itens: [{ rotulo: 'Peças', icone: 'fa-solid fa-cart-flatbed', rota: '/estoque' }],
    },
    {
      titulo: 'Financeiro',
      itens: [
        { rotulo: 'Financeiro', icone: 'fa-solid fa-chart-line', rota: '/financeiro' },
        { rotulo: 'Caixa', icone: 'fa-solid fa-wallet', rota: '/caixa' },
      ],
    },
    {
      titulo: 'Sistema',
      itens: [{ rotulo: 'Configurações', icone: 'fa-solid fa-gear', rota: '/configuracoes' }],
    },
  ];

  protected readonly menuDoUsuario: MenuItem[] = [
    { label: 'Meu perfil', icon: 'fa-solid fa-user', routerLink: '/configuracoes' },
    { separator: true },
    { label: 'Sair da conta', icon: 'fa-solid fa-right-from-bracket', command: () => this.sair() },
  ];

  /** Encerra a sessao e retorna para a tela de login */
  protected sair(): void {
    this.autenticacaoService.sair();
    this.roteador.navigate(['/entrar']);
  }
}
