import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('usuarios_enderecos')
export class UsuarioEndereco {
  @PrimaryColumn({ name: 'usuario_id', type: 'integer' })
  usuarioId: number;

  @PrimaryColumn({ name: 'endereco_id', type: 'integer' })
  enderecoId: number;

  @CreateDateColumn({ name: 'data_criacao', type: 'timestamp' })
  dataCriacao: Date;
}
