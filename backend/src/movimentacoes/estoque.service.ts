import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';
import { Paginado } from '../common/interface/paginado.interface.js';
import { Produto } from '../produtos/produto.entity.js';
import { EstoqueProduto } from '../produtos/estoque-produto.entity.js';
import { Lote } from '../produtos/lote.entity.js';
import { Local } from '../locais/local.entity.js';
import { EstoqueAtual } from './estoque-atual.entity.js';
import {
  EstoqueDetalhe,
  EstoqueResumo,
  PosicaoEstoque,
} from './estoque.interface.js';

@Injectable()
export class EstoqueService {
  constructor(private readonly dataSource: DataSource) {}

  async listar(paginacao: PaginacaoDto): Promise<Paginado<EstoqueResumo>> {
    const { pagina, limite } = paginacao;

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

    return { dados, total, pagina, limite };
  }

  async detalhar(produtoId: number): Promise<EstoqueDetalhe> {
    const produto = await this.dataSource.manager.findOne(Produto, {
      where: { id: produtoId },
      select: {
        id: true,
        codigo: true,
        nome: true,
        ativo: true,
        estoqueMinimo: true,
      },
    });
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }

    const estoqueProduto = await this.dataSource.manager.findOneOrFail(
      EstoqueProduto,
      {
        where: { produtoId },
      },
    );

    const posicoes = await this.dataSource
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

    return {
      produtoId: produto.id,
      codigo: produto.codigo,
      nome: produto.nome,
      ativo: produto.ativo,
      quantidadeTotal: estoqueProduto.quantidadeTotal,
      estoqueMinimo: produto.estoqueMinimo,
      posicoes,
    };
  }
}
