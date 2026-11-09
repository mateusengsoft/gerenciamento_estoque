import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuariosEnderecos1794234535186 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table usuarios_enderecos (
            usuario_id integer not null,
            endereco_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint pk_usuarios_enderecos primary key (usuario_id, endereco_id),
            constraint fk_usuarios_enderecos_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict,
            constraint fk_usuarios_enderecos_endereco_id foreign key(endereco_id) references enderecos(id) on delete restrict
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table usuarios_enderecos`);
  }
}
