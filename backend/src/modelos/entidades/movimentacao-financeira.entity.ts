import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FormaPagamento, TipoMovimentacao } from '../enums';
import { Caixa } from './caixa.entity';
import { OrdemServico } from './ordem-servico.entity';

@Entity('movimentacoes_financeiras')
export class MovimentacaoFinanceira {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  @Column()
  descricao: string;

  @Column({ type: 'varchar' })
  tipo: TipoMovimentacao;

  @Column()
  categoria: string;

  @Column({ type: 'varchar' })
  formaPagamento: FormaPagamento;

  @Column('real')
  valor: number;

  @Column({ type: 'int', nullable: true })
  ordemId: number | null;

  @ManyToOne(() => OrdemServico, { nullable: true })
  @JoinColumn({ name: 'ordemId' })
  ordem: OrdemServico | null;

  @Column({ type: 'int', nullable: true })
  caixaId: number | null;

  @ManyToOne(() => Caixa, { nullable: true })
  @JoinColumn({ name: 'caixaId' })
  caixa: Caixa | null;
}
