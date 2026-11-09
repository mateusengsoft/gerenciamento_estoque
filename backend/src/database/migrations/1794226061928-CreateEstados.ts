import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEstados1794226061928 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(` create table estados(
             id serial primary key,
            nome varchar(50) not null,
            codigo_uf integer not null,
            uf char(2) not null,
            pais_id integer not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

                constraint uq_estados_nome unique (nome),
                constraint uq_estados_codigo_uf unique (codigo_uf),
                constraint uq_estados_uf unique (uf),
                constraint chk_estados_nome check (btrim(nome) <> ''),
                constraint chk_estados_uf check(uf ~ '^[A-Z]{2}$'),
                constraint fk_estados_pais_id foreign key (pais_id) references paises(id) on delete restrict,
                constraint fk_estados_usuario_id foreign key (usuario_id) references usuarios(id) on delete restrict
            
                )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('drop table estados');
  }
}
