import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('fornecedores_contatos')
export class FornecedorContato {
  @PrimaryColumn({ type: 'integer', name: 'fornecedor_id' })
  fornecedorId: number;

  @PrimaryColumn({ type: 'integer', name: 'contato_id' })
  contatoId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
