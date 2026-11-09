import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBairros1794229524661 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table bairros (
        id serial primary key,
        codigo char(10) not null, 
        nome varchar(255) not null,
        municipio_id integer not null,
        usuario_id integer not null,
        data_criacao timestamp not null default current_timestamp,

            constraint chk_bairros_codigo_formato check(codigo ~ '^[0-9]{10}$'),
            constraint uq_bairros_codigo unique(codigo),
            constraint chk_bairros_nome check(btrim(nome) <> ''),
            constraint fk_bairros_municipio_id foreign key(municipio_id) references municipios(id) on delete restrict,
            constraint fk_bairros_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
        
        )`);

    await queryRunner.query(`
        create index idx_bairros_municipio_id on bairros (municipio_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('drop table bairros');
  }
}
