import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMovimentacoesEstoque1794322460817 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `create type tipo_movimentacao as enum ('ENTRADA', 'SAIDA', 'TRANSFERENCIA')`,
    );
    await queryRunner.query(
      `create type motivo_movimentacao as enum ('COMPRA', 'VENDA', 'PERDA', 'VENCIMENTO')`,
    );

    await queryRunner.query(`create table movimentacoes_estoque (
            id serial primary key,
            tipo_movimentacao tipo_movimentacao not null,
            motivo motivo_movimentacao,
            quantidade numeric(10,3) not null,
            data_movimentacao timestamp not null,
            data_criacao timestamp not null default current_timestamp,
            valor_unitario numeric(10,2),
            lote_id integer not null,
            aquisicao_id integer,
            local_origem_id integer,
            local_destino_id integer,
            usuario_id integer not null,
            observacao varchar(255),

            constraint chk_movimentacoes_estoque_quantidade check (quantidade > 0),
            constraint chk_movimentacoes_estoque_valor_unitario check (valor_unitario >= 0),
            constraint chk_movimentacoes_estoque_observacao check (btrim(observacao) <> ''),
            constraint chk_movimentacoes_estoque_local_origem_destino_diferentes check (local_origem_id <> local_destino_id),
            constraint fk_movimentacoes_estoque_lote_id foreign key (lote_id) references lotes(id) on delete restrict,
            constraint fk_movimentacoes_estoque_aquisicao_id foreign key (aquisicao_id) references aquisicoes(id) on delete restrict,
            constraint fk_movimentacoes_estoque_local_origem_id foreign key (local_origem_id) references locais(id) on delete restrict,
            constraint fk_movimentacoes_estoque_local_destino_id foreign key (local_destino_id) references locais(id) on delete restrict,
            constraint fk_movimentacoes_estoque_usuario_id foreign key (usuario_id) references usuarios(id) on delete restrict,
            constraint chk_movimentacoes_estoque_combinacao check (
                    (tipo_movimentacao = 'ENTRADA'
                                and motivo is not distinct from 'COMPRA'
                                and local_origem_id  is null
                                and local_destino_id is not null
                                and aquisicao_id     is not null
                                and valor_unitario   is not null
                    ) 
                    
                    or  
                     
                     (tipo_movimentacao = 'SAIDA'
                                and motivo is not distinct from 'VENDA'
                                and local_origem_id  is not null
                                and local_destino_id is null
                                and aquisicao_id     is null
                                and valor_unitario   is not null

                    )       
                    or 


                        (tipo_movimentacao = 'SAIDA'
                                and (motivo is not distinct from 'PERDA' or motivo is not distinct from 'VENCIMENTO')
                                and local_origem_id  is not null
                                and local_destino_id is null
                                and aquisicao_id     is null
                                and valor_unitario   is null
                                                          
                         )                                  
                    or 

                        (tipo_movimentacao = 'TRANSFERENCIA'
                                and motivo is null
                                and local_origem_id  is not null
                                and local_destino_id is not null
                                and aquisicao_id     is null
                                and valor_unitario   is null
                        )      
                    )

            
            )`);
    await queryRunner.query(
      `create index idx_movimentacoes_estoque_lote_id_local_destino_id on movimentacoes_estoque (lote_id, local_destino_id)`,
    );
    await queryRunner.query(
      `create index idx_movimentacoes_estoque_data_movimentacao on movimentacoes_estoque (data_movimentacao)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table movimentacoes_estoque`);
    await queryRunner.query(`drop type motivo_movimentacao`);
    await queryRunner.query(`drop type tipo_movimentacao`);
  }
}
