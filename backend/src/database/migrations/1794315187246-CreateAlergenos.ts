import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlergenos1794315187246 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table alergenos (
            id serial primary key,
            nome varchar(50) not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint chk_alergenos_nome check(btrim(nome) <> ''),
            constraint fk_alergenos_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            
            )`);

    await queryRunner.query(`
                create unique index uq_alergenos_nome_lower on alergenos (lower(nome))
                `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table alergenos`);
  }
}
