import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaises1794190054262 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `create table paises(
                id              serial          primary key,
                nome            varchar(255)    not null,
                sigla           varchar(3)         not null,
                usuario_id      integer         not null,
                data_criacao     timestamp      not null default current_timestamp,
                
                constraint uq_paises_nome unique (nome),
                constraint uq_paises_sigla unique (sigla),
                constraint chk_paises_nome check (btrim(nome) <> ''),
                constraint chk_paises_sigla check (sigla ~ '^[A-Z]{3}$'),
                constraint fk_paises_usuario_id foreign key (usuario_id) references usuarios(id) on delete restrict 
                )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table paises`);
  }
}
