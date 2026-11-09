import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnderecos1794231132154 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table enderecos (
             id serial primary key,
             logradouro varchar(255) not null,
             numero varchar(10),
             complemento varchar(255),
             cep varchar(9) not null,
             municipio_id integer not null,
             bairro_id integer ,
             bairro_nome varchar(255),
             usuario_id integer not null,
             data_criacao timestamp not null default current_timestamp,
             
                constraint chk_enderecos_logradouro check(btrim(logradouro) <> ''),
                constraint chk_enderecos_numero check(btrim(numero) <> ''),
                constraint chk_enderecos_complemento check(btrim(complemento) <> ''),
                constraint chk_enderecos_cep check(cep ~ '^[0-9]{5}-?[0-9]{3}$'),
                constraint chk_enderecos_bairro_nome_bairro_id check ((bairro_id IS NULL) <> (bairro_nome IS NULL)),
                constraint chk_enderecos_bairro_nome check(btrim(bairro_nome) <> ''),
                constraint fk_enderecos_municipio_id foreign key(municipio_id) references municipios(id) on delete restrict,
                constraint fk_enderecos_bairro_id foreign key(bairro_id) references bairros(id) on delete restrict,
                constraint fk_enderecos_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
          
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table enderecos`);
  }
}
