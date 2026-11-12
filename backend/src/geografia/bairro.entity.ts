import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('bairros')
export class Bairro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 10 })
  codigo: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'integer', name: 'municipio_id' })
  municipioId: number;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
