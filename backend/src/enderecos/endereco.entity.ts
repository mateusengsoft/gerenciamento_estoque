import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('enderecos')
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  logradouro: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  numero: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complemento: string | null;

  @Column({ type: 'varchar', length: 9 })
  cep: string;

  @Column({ name: 'municipio_id', type: 'integer' })
  municipioId: number;

  @Column({ name: 'bairro_id', type: 'integer', nullable: true })
  bairroId: number | null;

  @Column({ type: 'varchar', length: 255, name: 'bairro_nome', nullable: true })
  bairroNome: string | null;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
