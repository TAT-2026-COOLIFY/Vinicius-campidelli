import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimentacaoFinanceira, OrdemServico } from '../../modelos';
import { CaixaModule } from '../caixa/caixa.module';
import { FinanceiroController } from './financeiro.controller';
import { FinanceiroService } from './financeiro.service';

@Module({
  imports: [TypeOrmModule.forFeature([MovimentacaoFinanceira, OrdemServico]), CaixaModule],
  controllers: [FinanceiroController],
  providers: [FinanceiroService],
  exports: [FinanceiroService],
})
export class FinanceiroModule {}
