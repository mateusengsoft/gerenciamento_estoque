import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('estoques_produtos')
export class EstoqueProduto {
  @PrimaryColumn({ type: 'integer', name: 'produto_id' })
  produtoId: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 3,
    name: 'quantidade_total',
    default: 0,
  })
  quantidadeTotal: string;
}
