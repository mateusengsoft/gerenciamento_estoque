import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLocais1794237630459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table locais (
            id serial primary key,
            corredor varchar(10) not null,
            prateleira varchar(10) not null,
            secao varchar(10) not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint chk_locais_corredor check(btrim(corredor) <> ''),
            constraint chk_locais_prateleira check(btrim(prateleira) <> ''),
            constraint chk_locais_secao check(btrim(secao) <> ''),
            constraint uq_locais_corredor_prateleira_secao unique(corredor, prateleira, secao),
            constraint fk_locais_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table locais`);
  }
}
