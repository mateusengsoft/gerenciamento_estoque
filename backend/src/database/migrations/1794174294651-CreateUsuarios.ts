import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuarios1794174294651 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `create type tipo_usuario as enum('ADMINISTRADOR','OPERADOR_ESTOQUE') `,
    );

    await queryRunner.query(`
     create table usuarios (
             id           serial       primary key,
             login        varchar(20)  not null,
             senha_hash   varchar(255) not null,
             nome         varchar(255) not null,
             email        varchar(255) not null,
             tipo         tipo_usuario not null,
             cpf          varchar(11)  not null,
             data_criacao timestamp    not null default current_timestamp,
             ativo        boolean      not null default true,

             constraint uq_usuarios_cpf          unique (cpf),
             constraint chk_usuarios_cpf_formato check (cpf ~ '^[0-9]{11}$'),
             constraint chk_usuarios_login       check (btrim(login) <> ''),
             constraint chk_usuarios_senha_hash  check (btrim(senha_hash) <> ''),
             constraint chk_usuarios_nome        check (btrim(nome) <> ''),
             constraint chk_usuarios_email       check (btrim(email) <> '')
    )       
  `);

    await queryRunner.query(`
    create unique index uq_usuarios_login_lower on usuarios (lower(login))
  `);

    await queryRunner.query(`
    create unique index uq_usuarios_email_lower on usuarios (lower(email))
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table usuarios`);
    await queryRunner.query(`drop type tipo_usuario`);
  }
}
