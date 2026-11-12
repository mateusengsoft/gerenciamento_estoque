import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('contatos')
export class Contato {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 5, name: 'codigo_pais', default: '55' })
  codigoPais: string;

  @Column({ type: 'varchar', length: 2 })
  ddd: string;

  @Column({ type: 'varchar', length: 9 })
  numero: string;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
