import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInformacoesNutricionais1794313168911 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create table informacoes_nutricionais (
                id serial primary key,
                tamanho_porcao numeric(10,2),
                unidade_porcao_id integer,
                valor_energetico numeric(10,2),
                carboidratos numeric(10,2),
                proteinas numeric(10,2),
                gorduras_totais numeric(10,2),
                fibras numeric(10,2),
                sodio numeric(10,2),
                produto_id integer not null,
                usuario_id integer not null,
                data_criacao timestamp not null default current_timestamp,

                constraint uq_informacoes_nutricionais_produto_id unique(produto_id),
                constraint chk_informacoes_nutricionais_valor_energetico check(valor_energetico >= 0),
                constraint chk_informacoes_nutricionais_tamanho_porcao check(tamanho_porcao > 0),
                constraint chk_informacoes_nutricionais_carboidratos check(carboidratos >= 0),
                constraint chk_informacoes_nutricionais_proteinas check(proteinas >= 0),
                constraint chk_informacoes_nutricionais_gorduras_totais check(gorduras_totais >= 0),
                constraint chk_informacoes_nutricionais_fibras check(fibras >= 0),
                constraint chk_informacoes_nutricionais_sodio check(sodio >= 0),
                constraint chk_informacoes_nutricionais_porcao check((tamanho_porcao is null) = (unidade_porcao_id is null)),
                constraint fk_informacoes_nutricionais_unidade_porcao_id foreign key(unidade_porcao_id) references unidades_medida(id) on delete restrict,
                constraint fk_informacoes_nutricionais_produto_id foreign key(produto_id) references produtos(id) on delete restrict,
                constraint fk_informacoes_nutricionais_usuario_id foreign key(usuario_id) references usuarios(id) on delete restrict

            )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table informacoes_nutricionais`);
  }
}
