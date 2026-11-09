import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEstoquesProdutos1794245904026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table estoques_produtos (
            produto_id integer not null,
            quantidade_total numeric(10,3) not null default 0,

            constraint pk_estoques_produtos primary key(produto_id),
            constraint fk_estoques_produtos_produto_id foreign key(produto_id) references produtos(id) on delete restrict,
            constraint chk_estoques_produtos_quantidade_total check(quantidade_total >= 0)
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table estoques_produtos`);
  }
}
