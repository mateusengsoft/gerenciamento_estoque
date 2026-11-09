import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuariosContatos1794234062657 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table usuarios_contatos (
            usuario_id integer not null,
            contato_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint pk_usuarios_contatos primary key (usuario_id, contato_id),
            constraint fk_usuarios_contatos_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict,
            constraint fk_usuarios_contatos_contato_id foreign key(contato_id) references contatos(id) on delete restrict

            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table usuarios_contatos`);
  }
}
