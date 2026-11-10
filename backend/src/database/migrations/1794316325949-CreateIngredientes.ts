import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIngredientes1794316325949 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table ingredientes (
            id serial primary key,
            nome varchar(255) not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint chk_ingredientes_nome check(btrim(nome) <> ''),
            constraint fk_ingredientes_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            )`);

    await queryRunner.query(`
                create unique index uq_ingredientes_nome_lower on ingredientes (lower(nome))
                `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table ingredientes`);
  }
}
