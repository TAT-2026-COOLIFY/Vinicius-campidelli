import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SituacaoAgendamento } from '../enums';
import { Cliente } from './cliente.entity';
import { Servico } from './servico.entity';
import { Veiculo } from './veiculo.entity';

@Entity('agendamentos')
export class Agendamento {
  @PrimaryGeneratedColumn()
  id: number;

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
  servicoId: number;

  @ManyToOne(() => Servico)
  @JoinColumn({ name: 'servicoId' })
  servico: Servico;

  @Column()
  data: string;

  @Column()
  horario: string;

  @Column({ type: 'varchar' })
  situacao: SituacaoAgendamento;

  @Column({ default: '' })
  observacao: string;
}
