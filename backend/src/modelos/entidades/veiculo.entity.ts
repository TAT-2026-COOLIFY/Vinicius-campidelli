import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from './cliente.entity';

@Entity('veiculos')
export class Veiculo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  modelo: string;

  @Column()
  marca: string;

  @Column({ unique: true })
  placa: string;

  @Column('int')
  ano: number;

  @Column()
  cor: string;

  @Column('real')
  quilometragem: number;

  @Column()
  clienteId: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.veiculos)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;
}
