import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('estados')
export class Estado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nome: string;

  @Column({ type: 'integer', name: 'codigo_uf' })
  codigoUf: number;

  @Column({ type: 'char', length: 2 })
  uf: string;

  @Column({ type: 'integer', name: 'pais_id' })
  paisId: number;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
