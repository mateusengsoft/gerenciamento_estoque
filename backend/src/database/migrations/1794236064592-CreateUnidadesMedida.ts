import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUnidadesMedida1794236064592 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table unidades_medida (
            id serial primary key,
            nome varchar(50) not null,
            sigla varchar(5) not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

            constraint uq_unidades_medida_sigla unique(sigla),
            constraint uq_unidades_medida_nome unique(nome),
            constraint chk_unidades_medida_nome check(btrim(nome) <> ''),
            constraint chk_unidades_medida_sigla check(btrim(sigla) <> ''),
            constraint fk_unidades_medida_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('drop table unidades_medida');
  }
}
