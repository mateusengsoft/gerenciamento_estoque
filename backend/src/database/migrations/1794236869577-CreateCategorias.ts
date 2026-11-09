import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategorias1794236869577 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table categorias (
                id serial primary key,
                nome varchar(50) not null,
                usuario_id integer not null,
                data_criacao timestamp not null default current_timestamp,

                constraint chk_categorias_nome check(btrim(nome) <> ''),
                constraint fk_categorias_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            )`);

    await queryRunner.query(
      `create unique index uq_categorias_nome_lower on categorias (lower(nome))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('drop table categorias');
  }
}
