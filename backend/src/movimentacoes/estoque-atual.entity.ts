import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('estoques_atuais')
export class EstoqueAtual {
  @PrimaryColumn({ name: 'lote_id', type: 'integer' })
  loteId: number;

  @PrimaryColumn({ name: 'local_id', type: 'integer' })
  localId: number;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  quantidade: string;
}
