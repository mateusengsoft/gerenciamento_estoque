import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLotes1794247453814 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table lotes (
            id serial primary key,
            codigo_lote varchar(50) not null,
            data_fabricacao date not null,
            data_vencimento date,
            produto_id integer not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint uq_lotes_produto_id_codigo_lote unique(produto_id, codigo_lote),
            constraint chk_lotes_codigo_lote check(btrim(codigo_lote) <> ''),
            constraint chk_lotes_vencimento_apos_fabricacao check(data_fabricacao < data_vencimento),
            constraint fk_lotes_produto_id foreign key(produto_id) references produtos(id) on delete restrict,
            constraint fk_lotes_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table lotes`);
  }
}
