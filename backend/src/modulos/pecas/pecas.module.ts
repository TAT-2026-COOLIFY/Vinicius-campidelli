import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemOrdem, Peca } from '../../modelos';
import { PecasController } from './pecas.controller';
import { PecasService } from './pecas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Peca, ItemOrdem])],
  controllers: [PecasController],
  providers: [PecasService],
  exports: [PecasService],
})
export class PecasModule {}
