import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContatos1794232565958 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table contatos (
                id serial primary key,
                codigo_pais varchar(5) not null default '55',
                ddd varchar(2) not null,
                numero varchar(9) not null,
                usuario_id integer not null,
                data_criacao timestamp not null default current_timestamp,
                
                constraint chk_contatos_codigo_pais_formato check(codigo_pais ~ '^[0-9]{1,3}$'),
                constraint chk_contatos_ddd_formato check(ddd ~ '^[0-9]{2}$'),
                constraint chk_contatos_numero_formato check(numero ~ '^[0-9]{8,9}$'),
                constraint fk_contatos_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table contatos`);
  }
}
