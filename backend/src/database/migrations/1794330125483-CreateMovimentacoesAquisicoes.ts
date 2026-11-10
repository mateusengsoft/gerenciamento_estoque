import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMovimentacoesAquisicoes1794330125483 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table movimentacoes_aquisicoes (
            id serial primary key,
            movimentacao_id integer not null,
            aquisicao_id integer not null,
            movimentacao_disponibilizacao_id integer not null,
            quantidade numeric(10,3) not null,

            constraint chk_movimentacoes_aquisicoes_quantidade check (quantidade > 0),
            constraint uq_movimentacoes_aquisicoes_alocacao unique (movimentacao_id, aquisicao_id, movimentacao_disponibilizacao_id),
            constraint fk_movimentacoes_aquisicoes_movimentacao_id foreign key (movimentacao_id) references movimentacoes_estoque(id) on delete restrict,
            constraint fk_movimentacoes_aquisicoes_aquisicao_id foreign key (aquisicao_id) references aquisicoes(id) on delete restrict,
            constraint fk_movimentacoes_aquisicoes_movimentacao_disponibilizacao_id foreign key (movimentacao_disponibilizacao_id) references movimentacoes_estoque(id) on delete restrict
        )`);

    await queryRunner.query(
      `create index idx_movimentacoes_aquisicoes_movimentacao_disponibilizacao_id on movimentacoes_aquisicoes (movimentacao_disponibilizacao_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table movimentacoes_aquisicoes`);
  }
}
