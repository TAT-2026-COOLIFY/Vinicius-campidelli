import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pecas')
export class Peca {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column()
  nome: string;

  @Column()
  marca: string;

  @Column('int')
  quantidade: number;

  @Column('int')
  quantidadeMinima: number;

  @Column('real')
  precoUnitario: number;
}
