import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLocaisProdutos1794246462742 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table locais_produtos (
            produto_id integer not null,  
            local_id integer not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

                constraint pk_locais_produtos primary key(produto_id, local_id),
                constraint fk_locais_produtos_local_id foreign key(local_id) references locais(id) on delete restrict,
                constraint fk_locais_produtos_produto_id foreign key(produto_id) references produtos(id) on delete restrict,
                constraint fk_locais_produtos_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict

            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table locais_produtos`);
  }
}
