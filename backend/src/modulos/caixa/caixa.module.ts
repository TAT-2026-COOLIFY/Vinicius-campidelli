import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caixa, MovimentacaoFinanceira } from '../../modelos';
import { CaixaController } from './caixa.controller';
import { CaixaService } from './caixa.service';

@Module({
  imports: [TypeOrmModule.forFeature([Caixa, MovimentacaoFinanceira])],
  controllers: [CaixaController],
  providers: [CaixaService],
  exports: [CaixaService],
})
export class CaixaModule {}
