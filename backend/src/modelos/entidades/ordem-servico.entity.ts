import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StatusOrdem } from '../enums';
import { Cliente } from './cliente.entity';
import { ItemOrdem } from './item-ordem.entity';
import { Veiculo } from './veiculo.entity';

@Entity('ordens_servico')
export class OrdemServico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numero: string;

  @Column()
  clienteId: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column()
  veiculoId: number;

  @ManyToOne(() => Veiculo)
  @JoinColumn({ name: 'veiculoId' })
  veiculo: Veiculo;

  @Column()
  dataAbertura: string;

  @Column({ type: 'varchar', nullable: true })
  dataConclusao: string | null;

  @Column({ type: 'varchar' })
  status: StatusOrdem;

  @Column({ default: '' })
  observacoes: string;

  @OneToMany(() => ItemOrdem, (item) => item.ordem, { cascade: true })
  itens: ItemOrdem[];

  @Column('real', { default: 0 })
  valorTotal: number;
}
