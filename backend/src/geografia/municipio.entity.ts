import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('municipios')
export class Municipio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  codigo: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'integer', name: 'estado_id' })
  estadoId: number;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
