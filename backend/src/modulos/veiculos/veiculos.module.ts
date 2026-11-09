import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdemServico, Veiculo } from '../../modelos';
import { ClientesModule } from '../clientes/clientes.module';
import { VeiculosController } from './veiculos.controller';
import { VeiculosService } from './veiculos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Veiculo, OrdemServico]), ClientesModule],
  controllers: [VeiculosController],
  providers: [VeiculosService],
  exports: [VeiculosService],
})
export class VeiculosModule {}
