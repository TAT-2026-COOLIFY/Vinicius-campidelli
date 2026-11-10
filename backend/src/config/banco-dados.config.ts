import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import {
  Agendamento,
  Caixa,
  Cliente,
  Configuracao,
  ItemOrdem,
  MovimentacaoFinanceira,
  OrdemServico,
  Peca,
  Servico,
  Veiculo,
} from '../modelos';

export const configuracaoBancoDados: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: process.env.DATABASE_PATH ?? path.resolve(process.cwd(), 'banco-dados.sqlite'),
  entities: [
    Cliente,
    Veiculo,
    Servico,
    Agendamento,
    Peca,
    OrdemServico,
    ItemOrdem,
    MovimentacaoFinanceira,
    Caixa,
    Configuracao,
  ],
  synchronize: true,
};
