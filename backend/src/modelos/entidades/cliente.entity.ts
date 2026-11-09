import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Veiculo } from './veiculo.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  telefone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  endereco: string;

  @Column()
  cidade: string;

  @Column()
  criadoEm: string;

  @OneToMany(() => Veiculo, (veiculo) => veiculo.cliente)
  veiculos: Veiculo[];
}
