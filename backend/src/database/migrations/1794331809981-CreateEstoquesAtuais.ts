import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEstoquesAtuais1794331809981 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table estoques_atuais (
                lote_id integer not null,
                local_id integer not null,
                quantidade numeric(10,3) not null,

                constraint pk_estoques_atuais primary key (lote_id, local_id),
                constraint chk_estoques_atuais_quantidade check (quantidade >= 0),
                constraint fk_estoques_atuais_lote_id foreign key (lote_id) references lotes(id) on delete restrict,
                constraint fk_estoques_atuais_local_id foreign key (local_id) references locais(id) on delete restrict
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table estoques_atuais`);
  }
}
