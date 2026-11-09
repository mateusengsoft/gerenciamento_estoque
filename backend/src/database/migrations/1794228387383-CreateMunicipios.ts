import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMunicipios1794228387383 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query( `create table municipios (
            id serial primary key,
            codigo integer not null,
            nome varchar(255) not null,
            estado_id integer not null,
            usuario_id integer not null,
            data_criacao timestamp not null default current_timestamp,

                constraint chk_municipios_codigo check(codigo > 0),
                constraint uq_municipios_codigo unique (codigo),
                constraint chk_municipios_nome check(btrim(nome) <> ''),
                constraint uq_municipios_nome_estado_id unique (estado_id,nome),
                constraint fk_municipios_estado_id foreign key (estado_id) references estados(id) on delete restrict,
                constraint fk_municipios_usuario_id foreign key (usuario_id) references usuarios(id) on delete restrict
            )`);

        await queryRunner.query(`
            create index idx_municipios_estado_id on municipios (estado_id)
            `);
        }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop table municipios`);
    }

}
 