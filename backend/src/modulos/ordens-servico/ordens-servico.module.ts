import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente, ItemOrdem, MovimentacaoFinanceira, OrdemServico, Veiculo } from '../../modelos';
import { CaixaModule } from '../caixa/caixa.module';
import { PecasModule } from '../pecas/pecas.module';
import { ServicosModule } from '../servicos/servicos.module';
import { OrdensServicoController } from './ordens-servico.controller';
import { OrdensServicoService } from './ordens-servico.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdemServico, ItemOrdem, Cliente, Veiculo, MovimentacaoFinanceira]),
    PecasModule,
    ServicosModule,
    CaixaModule,
  ],
  controllers: [OrdensServicoController],
  providers: [OrdensServicoService],
  exports: [OrdensServicoService],
})
export class OrdensServicoModule {}
