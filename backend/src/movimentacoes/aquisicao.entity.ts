import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('aquisicoes')
export class Aquisicao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'codigo_aquisicao', type: 'varchar', length: 255 })
  codigoAquisicao: string;

  @Column({ name: 'fornecedor_id', type: 'integer' })
  fornecedorId: number;

  @Column({ name: 'lote_id', type: 'integer' })
  loteId: number;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  quantidade: string;

  @Column({ name: 'valor_unitario', type: 'numeric', precision: 10, scale: 2 })
  valorUnitario: string;

  @Column({ name: 'data_aquisicao', type: 'timestamp' })
  dataAquisicao: Date;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
