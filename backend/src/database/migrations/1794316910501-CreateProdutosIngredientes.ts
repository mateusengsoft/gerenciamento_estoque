import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProdutosIngredientes1794316910501 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table produtos_ingredientes (
                produto_id integer not null,
                ingrediente_id integer not null,
                usuario_id integer not null,
                data_criacao timestamp not null default current_timestamp,

                constraint pk_produtos_ingredientes primary key(produto_id, ingrediente_id),
                constraint fk_produtos_ingredientes_produto_id foreign key(produto_id) references produtos(id) on delete restrict,
                constraint fk_produtos_ingredientes_ingrediente_id foreign key(ingrediente_id) references ingredientes(id) on delete restrict,
                constraint fk_produtos_ingredientes_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table produtos_ingredientes`);
  }
}
