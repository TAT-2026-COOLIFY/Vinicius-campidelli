import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agendamento, Cliente, OrdemServico, Veiculo } from '../../modelos';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { OrdensServicoModule } from '../ordens-servico/ordens-servico.module';
import { PecasModule } from '../pecas/pecas.module';
import { ServicosModule } from '../servicos/servicos.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente, Veiculo, OrdemServico, Agendamento]),
    OrdensServicoModule,
    FinanceiroModule,
    PecasModule,
    ServicosModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
