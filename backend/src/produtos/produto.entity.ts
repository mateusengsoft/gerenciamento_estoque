import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  nome: string;

  @Column({ type: 'varchar', length: 50 })
  codigo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descricao: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'data_cadastro',
  })
  dataCadastro: Date;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'preco_venda_atual',
  })
  precoVendaAtual: string;

  @Column({ type: 'integer', name: 'categoria_id' })
  categoriaId: number;

  @Column({ type: 'integer', name: 'unidade_estoque_id' })
  unidadeEstoqueId: number;

  @Column({ type: 'integer', name: 'unidade_conteudo_id', nullable: true })
  unidadeConteudoId: number | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 3,
    name: 'quantidade_conteudo',
    nullable: true,
  })
  quantidadeConteudo: string | null;

  @Column({ type: 'integer', name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'boolean', default: true })
  perecivel: boolean;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 3,
    name: 'estoque_minimo',
    default: 0,
  })
  estoqueMinimo: string;
}
