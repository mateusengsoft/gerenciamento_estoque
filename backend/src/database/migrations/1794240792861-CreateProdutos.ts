import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProdutos1794240792861 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table produtos (
            id serial primary key,
            codigo varchar(50) not null,
            nome varchar(50) not null,
            descricao varchar(255),
            data_cadastro timestamp not null default current_timestamp,
            preco_venda_atual numeric(10,2) not null,
            categoria_id integer not null,
            unidade_estoque_id integer not null,
            unidade_conteudo_id integer, 
            quantidade_conteudo numeric(10,3),
            usuario_id integer not null,
            perecivel boolean not null default true,
            ativo boolean not null default true,
            estoque_minimo numeric(10,3) not null default 0,

            constraint chk_produtos_codigo check(btrim(codigo) <> ''),
            constraint uq_produtos_codigo unique(codigo),
            constraint chk_produtos_nome check(btrim(nome) <> ''),
            constraint chk_produtos_descricao check (btrim(descricao) <> ''),
            constraint chk_produtos_quantidade_conteudo check(quantidade_conteudo > 0),
            constraint chk_produtos_unidade_quantidade_conteudo check((quantidade_conteudo is null) = (unidade_conteudo_id is null)),
            constraint chk_produtos_estoque_minimo check(estoque_minimo >= 0),
            constraint chk_produtos_preco_venda_atual check(preco_venda_atual >= 0),
            constraint fk_produtos_categoria_id foreign key(categoria_id) references categorias(id) on delete restrict,
            constraint fk_produtos_unidade_estoque_id foreign key(unidade_estoque_id) references unidades_medida(id) on delete restrict,
            constraint fk_produtos_unidade_conteudo_id foreign key(unidade_conteudo_id) references unidades_medida(id) on delete restrict,
            constraint fk_produtos_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict
            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table produtos`);
  }
}
