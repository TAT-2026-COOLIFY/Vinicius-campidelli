import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SituacaoServico } from '../enums';

@Entity('servicos')
export class Servico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  descricao: string;

  @Column('real')
  preco: number;

  @Column('int')
  duracaoMinutos: number;

  @Column({ type: 'varchar', default: SituacaoServico.ATIVO })
  situacao: SituacaoServico;
}
