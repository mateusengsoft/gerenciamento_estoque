import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('fornecedores')
export class Fornecedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 14 })
  cnpj: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'integer', name: 'endereco_id' })
  enderecoId: number;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
