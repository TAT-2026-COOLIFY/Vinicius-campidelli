import { Routes } from '@angular/router';
import { LayoutPrincipalComponent } from './layout/layout-principal/layout-principal.component';
import { autenticacaoGuarda } from './nucleo/guardas/autenticacao.guarda';

/** Mapa de rotas da plataforma. As paginas sao carregadas sob demanda. */
export const ROTAS_APLICACAO: Routes = [
  {
    path: 'entrar',
    title: 'Acessar · Autocenter',
    loadComponent: () => import('./paginas/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutPrincipalComponent,
    canActivate: [autenticacaoGuarda],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Dashboard · Autocenter',
        loadComponent: () =>
          import('./paginas/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'clientes',
        title: 'Clientes · Autocenter',
        loadComponent: () =>
          import('./paginas/clientes/clientes.component').then((m) => m.ClientesComponent),
      },
      {
        path: 'veiculos',
        title: 'Veículos · Autocenter',
        loadComponent: () =>
          import('./paginas/veiculos/veiculos.component').then((m) => m.VeiculosComponent),
      },
      {
        path: 'servicos',
        title: 'Serviços · Autocenter',
        loadComponent: () =>
          import('./paginas/servicos/servicos.component').then((m) => m.ServicosComponent),
      },
      {
        path: 'agendamentos',
        title: 'Agendamentos · Autocenter',
        loadComponent: () =>
          import('./paginas/agendamentos/agendamentos.component').then(
            (m) => m.AgendamentosComponent,
          ),
      },
      {
        path: 'ordens-servico',
        title: 'Ordens de Serviço · Autocenter',
        loadComponent: () =>
          import('./paginas/ordens-servico/lista-ordens/lista-ordens.component').then(
            (m) => m.ListaOrdensComponent,
          ),
      },
      {
        path: 'ordens-servico/:id',
        title: 'Detalhes da ordem · Autocenter',
        loadComponent: () =>
          import('./paginas/ordens-servico/detalhe-ordem/detalhe-ordem.component').then(
            (m) => m.DetalheOrdemComponent,
          ),
      },
      {
        path: 'estoque',
        title: 'Estoque · Autocenter',
        loadComponent: () =>
          import('./paginas/estoque/estoque.component').then((m) => m.EstoqueComponent),
      },
      {
        path: 'financeiro',
        title: 'Financeiro · Autocenter',
        loadComponent: () =>
          import('./paginas/financeiro/financeiro.component').then((m) => m.FinanceiroComponent),
      },
      {
        path: 'caixa',
        title: 'Caixa · Autocenter',
        loadComponent: () => import('./paginas/caixa/caixa.component').then((m) => m.CaixaComponent),
      },
      {
        path: 'configuracoes',
        title: 'Configurações · Autocenter',
        loadComponent: () =>
          import('./paginas/configuracoes/configuracoes.component').then(
            (m) => m.ConfiguracoesComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
