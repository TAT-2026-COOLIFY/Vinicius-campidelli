import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuracaoBancoDados } from './config/banco-dados.config';
import { AgendamentosModule } from './modulos/agendamentos/agendamentos.module';
import { CaixaModule } from './modulos/caixa/caixa.module';
import { ClientesModule } from './modulos/clientes/clientes.module';
import { ConfiguracoesModule } from './modulos/configuracoes/configuracoes.module';
import { DashboardModule } from './modulos/dashboard/dashboard.module';
import { FinanceiroModule } from './modulos/financeiro/financeiro.module';
import { OrdensServicoModule } from './modulos/ordens-servico/ordens-servico.module';
import { PecasModule } from './modulos/pecas/pecas.module';
import { ServicosModule } from './modulos/servicos/servicos.module';
import { VeiculosModule } from './modulos/veiculos/veiculos.module';


@Module({
  imports: [
    TypeOrmModule.forRoot(configuracaoBancoDados),
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    AgendamentosModule,
    PecasModule,
    OrdensServicoModule,
    FinanceiroModule,
    CaixaModule,
    DashboardModule,
    ConfiguracoesModule,
  ],
})
export class AppModule {}
