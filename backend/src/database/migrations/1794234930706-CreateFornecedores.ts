import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFornecedores1794234930706 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table fornecedores (
            id serial primary key,
            nome varchar(255) not null,
            cnpj varchar(14) not null,
            email varchar(255) not null,
            endereco_id integer not null,
            ativo boolean not null default true,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint uq_fornecedores_cnpj unique (cnpj),
            constraint chk_fornecedores_cnpj_formato check (cnpj ~ '^[0-9]{14}$'),
            constraint chk_fornecedores_nome check (btrim(nome) <> ''),
            constraint chk_fornecedores_email check (btrim(email) <> ''),
            constraint fk_fornecedores_endereco_id foreign key(endereco_id) references enderecos(id) on delete restrict,
            constraint fk_fornecedores_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            )`);
    await queryRunner.query(
      `create unique index uq_fornecedores_email_lower on fornecedores (lower(email))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table fornecedores`);
  }
}
