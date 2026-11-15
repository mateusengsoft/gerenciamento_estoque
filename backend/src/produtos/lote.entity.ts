import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'codigo_lote' })
  codigoLote: string;

  @Column({ type: 'date', name: 'data_vencimento', nullable: true })
  dataVencimento: string | null;

  @Column({
    type: 'date',
    name: 'data_fabricacao',
  })
  dataFabricacao: string;

  @Column({ type: 'integer', name: 'produto_id' })
  produtoId: number;

  @Column({ type: 'integer', name: 'usuario_id' })
  usuarioId: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'data_criacao',
  })
  dataCriacao: Date;
}
