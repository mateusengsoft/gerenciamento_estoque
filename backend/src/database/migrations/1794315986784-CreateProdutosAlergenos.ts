import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProdutosAlergenos1794315986784 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table produtos_alergenos (
            produto_id integer not null,
            alergeno_id integer not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint pk_produtos_alergenos primary key(produto_id, alergeno_id),
            constraint fk_produtos_alergenos_produto_id foreign key(produto_id) references produtos(id) on delete restrict,
            constraint fk_produtos_alergenos_alergeno_id foreign key(alergeno_id) references alergenos(id) on delete restrict,
            constraint fk_produtos_alergenos_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table produtos_alergenos`);
  }
}
