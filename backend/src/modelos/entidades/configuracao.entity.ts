import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Dados cadastrais da oficina e preferencias operacionais do sistema (registro unico). */
@Entity('configuracoes')
export class Configuracao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Minha Oficina' })
  nomeFantasia: string;

  @Column({ default: '' })
  cnpj: string;

  @Column({ default: '' })
  telefone: string;

  @Column({ default: '' })
  endereco: string;

  @Column({ default: '08:00' })
  horarioAbertura: string;

  @Column({ default: '18:00' })
  horarioFechamento: string;

  /** Exibe aviso quando uma peca atinge a quantidade minima em estoque. */
  @Column({ default: true })
  avisoEstoqueMinimo: boolean;
}
