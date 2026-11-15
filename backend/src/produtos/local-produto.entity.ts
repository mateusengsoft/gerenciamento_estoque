import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('locais_produtos')
export class LocalProduto {
  @PrimaryColumn({ type: 'integer', name: 'produto_id' })
  produtoId: number;

  @PrimaryColumn({ type: 'integer', name: 'local_id' })
  localId: number;

  @Column({ type: 'integer', name: 'usuario_id' })
  usuarioId: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'data_criacao',
  })
  dataCriacao: Date;
}
