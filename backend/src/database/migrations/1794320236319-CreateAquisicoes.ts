import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAquisicoes1794320236319 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table aquisicoes (
            id serial primary key,
            codigo_aquisicao varchar(255) not null,
            fornecedor_id integer not null,
            lote_id integer not null,
            quantidade numeric(10,3) not null,
            valor_unitario numeric(10,2) not null,
            data_aquisicao timestamp not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint chk_aquisicoes_codigo_aquisicao check(btrim(codigo_aquisicao) <> ''),
            constraint uq_aquisicoes_fornecedor_id_codigo_aquisicao_lote_id unique(fornecedor_id, codigo_aquisicao, lote_id),
            constraint chk_aquisicoes_quantidade check(quantidade > 0),
            constraint chk_aquisicoes_valor_unitario check(valor_unitario >= 0),
            constraint fk_aquisicoes_fornecedor_id foreign key(fornecedor_id) references fornecedores(id) on delete restrict,
            constraint fk_aquisicoes_lote_id foreign key(lote_id) references lotes(id) on delete restrict,
            constraint fk_aquisicoes_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict

            )`);

    await queryRunner.query(`
            create index aquisicoes_lote_id on aquisicoes (lote_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table aquisicoes`);
  }
}
