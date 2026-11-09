import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFornecedoresContatos1794235520490 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table fornecedores_contatos (
            fornecedor_id integer not null,
            contato_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint pk_fornecedores_contatos primary key (fornecedor_id, contato_id),
            constraint fk_fornecedores_contatos_fornecedor_id foreign key(fornecedor_id) references fornecedores(id) on delete restrict,
            constraint fk_fornecedores_contatos_contato_id foreign key(contato_id) references contatos(id) on delete restrict
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('drop table fornecedores_contatos');
  }
}
