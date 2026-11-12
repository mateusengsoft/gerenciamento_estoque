import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('usuarios_contatos')
export class UsuarioContato {
  @PrimaryColumn({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @PrimaryColumn({ name: 'contato_id', type: 'integer' })
  contatoId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
