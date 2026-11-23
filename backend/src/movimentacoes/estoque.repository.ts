import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Produto } from '../produtos/produto.entity.js';
import { EstoqueProduto } from '../produtos/estoque-produto.entity.js';
import { Lote } from '../produtos/lote.entity.js';
import { Local } from '../locais/local.entity.js';
import { EstoqueAtual } from './estoque-atual.entity.js';
import type { EstoqueResumo, PosicaoEstoque } from './estoque.interface.js';

@Injectable()
export class EstoqueRepository {
  constructor(private readonly dataSource: DataSource) {}

  async listar(
    pagina: number,
    limite: number,
  ): Promise<[EstoqueResumo[], number]> {
    const consulta = this.dataSource
      .createQueryBuilder(Produto, 'p')
      .innerJoin(EstoqueProduto, 'ep', 'ep.produtoId = p.id');

    const total = await consulta.getCount();

    const dados = await consulta
      .select('p.id', 'produtoId')
      .addSelect('p.codigo', 'codigo')
      .addSelect('p.nome', 'nome')
      .addSelect('p.ativo', 'ativo')
      .addSelect('ep.quantidadeTotal', 'quantidadeTotal')
      .addSelect('p.estoqueMinimo', 'estoqueMinimo')
      .addSelect('ep.quantidade_total < p.estoque_minimo', 'abaixoDoMinimo')
      .orderBy('p.nome', 'ASC')
      .offset((pagina - 1) * limite)
      .limit(limite)
      .getRawMany<EstoqueResumo>();

    return [dados, total];
  }

  async buscarProduto(produtoId: number): Promise<Produto | null> {
    return this.dataSource.manager.findOne(Produto, {
      where: { id: produtoId },
      select: {
        id: true,
        codigo: true,
        nome: true,
        ativo: true,
        estoqueMinimo: true,
      },
    });
  }

  async buscarSaldoTotal(produtoId: number): Promise<EstoqueProduto> {
    return this.dataSource.manager.findOneOrFail(EstoqueProduto, {
      where: { produtoId },
    });
  }

  async listarPosicoes(produtoId: number): Promise<PosicaoEstoque[]> {
    return this.dataSource
      .createQueryBuilder(EstoqueAtual, 'ea')
      .innerJoin(Lote, 'l', 'l.id = ea.loteId')
      .innerJoin(Local, 'lo', 'lo.id = ea.localId')
      .where('l.produtoId = :produtoId', { produtoId })
      .andWhere('ea.quantidade > 0')
      .select('l.id', 'loteId')
      .addSelect('l.codigoLote', 'codigoLote')
      .addSelect(`to_char(l.data_vencimento, 'YYYY-MM-DD')`, 'dataVencimento')
      .addSelect('lo.id', 'localId')
      .addSelect('lo.corredor', 'corredor')
      .addSelect('lo.prateleira', 'prateleira')
      .addSelect('lo.secao', 'secao')
      .addSelect('ea.quantidade', 'quantidade')
      .orderBy('l.dataVencimento', 'ASC', 'NULLS LAST')
      .addOrderBy('l.id', 'ASC')
      .addOrderBy('lo.id', 'ASC')
      .getRawMany<PosicaoEstoque>();
  }
}
