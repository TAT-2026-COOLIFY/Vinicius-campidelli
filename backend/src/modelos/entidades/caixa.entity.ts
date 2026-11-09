import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('caixas')
export class Caixa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  data: string;

  @Column('real', { default: 0 })
  totalEntradas: number;

  @Column('real', { default: 0 })
  totalSaidas: number;

  @Column('real', { default: 0 })
  saldo: number;

  @Column({ default: true })
  aberto: boolean;
}
