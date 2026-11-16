import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoMovimentacao } from './tipo-movimentacao.enum.js';
import { MotivoMovimentacao } from './motivo-movimentacao.enum.js';

@Entity('movimentacoes_estoque')
export class MovimentacaoEstoque {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'tipo_movimentacao',
    type: 'enum',
    enum: TipoMovimentacao,
    enumName: 'tipo_movimentacao',
  })
  tipoMovimentacao: TipoMovimentacao;

  @Column({
    type: 'enum',
    enum: MotivoMovimentacao,
    enumName: 'motivo_movimentacao',
    nullable: true,
  })
  motivo: MotivoMovimentacao | null;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  quantidade: string;

  @Column({ name: 'data_movimentacao', type: 'timestamp' })
  dataMovimentacao: Date;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;

  @Column({
    name: 'valor_unitario',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  valorUnitario: string | null;

  @Column({ name: 'lote_id', type: 'integer' })
  loteId: number;

  @Column({ name: 'aquisicao_id', type: 'integer', nullable: true })
  aquisicaoId: number | null;

  @Column({ name: 'local_origem_id', type: 'integer', nullable: true })
  localOrigemId: number | null;

  @Column({ name: 'local_destino_id', type: 'integer', nullable: true })
  localDestinoId: number | null;

  @Column({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observacao: string | null;
}
