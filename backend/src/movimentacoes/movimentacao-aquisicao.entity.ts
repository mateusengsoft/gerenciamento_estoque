import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('movimentacoes_aquisicoes')
export class MovimentacaoAquisicao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'movimentacao_id', type: 'integer' })
  movimentacaoId: number;

  @Column({ name: 'aquisicao_id', type: 'integer' })
  aquisicaoId: number;

  @Column({ name: 'movimentacao_disponibilizacao_id', type: 'integer' })
  movimentacaoDisponibilizacaoId: number;

  @Column({ type: 'numeric', precision: 10, scale: 3 })
  quantidade: string;
}
