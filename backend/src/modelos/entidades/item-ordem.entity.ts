import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TipoItemOrdem } from '../enums';
import { OrdemServico } from './ordem-servico.entity';
import { Peca } from './peca.entity';
import { Servico } from './servico.entity';

/** Item (servico ou peca) lancado em uma ordem de servico. */
@Entity('itens_ordem')
export class ItemOrdem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  tipo: TipoItemOrdem;

  @Column()
  nome: string;

  @Column('int')
  quantidade: number;

  @Column('real')
  valorUnitario: number;

  @Column('real')
  valorTotal: number;

  @Column()
  ordemServicoId: number;

  @ManyToOne(() => OrdemServico, (ordem) => ordem.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ordemServicoId' })
  ordem: OrdemServico;

  @Column({ nullable: true })
  servicoId: number | null;

  @ManyToOne(() => Servico, { nullable: true })
  @JoinColumn({ name: 'servicoId' })
  servico: Servico | null;

  @Column({ nullable: true })
  pecaId: number | null;

  @ManyToOne(() => Peca, { nullable: true })
  @JoinColumn({ name: 'pecaId' })
  peca: Peca | null;
}
