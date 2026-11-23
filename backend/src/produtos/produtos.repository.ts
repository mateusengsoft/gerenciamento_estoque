import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import { Produto } from './produto.entity.js';
import { EstoqueProduto } from './estoque-produto.entity.js';
import { Lote } from './lote.entity.js';
import { LocalProduto } from './local-produto.entity.js';
import { Categoria } from '../categorias/categoria.entity.js';
import { Local } from '../locais/local.entity.js';
import { CriarProdutoDto } from './dto/criar-produto.dto.js';
import { FiltrarProdutosDto } from './dto/filtrar-produtos.dto.js';
import { AtualizarProdutoDto } from './dto/atualizar-produto.dto.js';
import type { ProdutoPublico } from './produto-publico.interface.js';
import type { ProdutoListagem } from './produto-listagem.interface.js';
import type { ProdutoDetalhe } from './produto-detalhe.interface.js';
import {
  CategoriaInexistenteError,
  CodigoDuplicadoError,
  ReferenciaInexistenteError,
} from './produtos.errors.js';

// O saldo total está abaixo do mínimo cadastrado.
const SQL_ESTOQUE_BAIXO = 'ep.quantidade_total < p.estoque_minimo';

// Existe algum lote do produto, ainda com saldo, que vence em até 30 dias (ou já venceu).
const SQL_PROXIMO_DO_VENCIMENTO = `exists (
  select 1
  from lotes l2
  join estoques_atuais ea on ea.lote_id = l2.id
  where l2.produto_id = p.id
    and ea.quantidade > 0
    and l2.data_vencimento <= current_date + 30
)`;

const CAMPOS_PUBLICOS = {
  id: true,
  nome: true,
  codigo: true,
  ativo: true,
} as const;

@Injectable()
export class ProdutosRepository {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Produto)
    private readonly repository: Repository<Produto>,

    @InjectRepository(Lote)
    private readonly lotesRepository: Repository<Lote>,

    @InjectRepository(Local)
    private readonly locaisRepository: Repository<Local>,

    @InjectRepository(LocalProduto)
    private readonly localProdutosRepository: Repository<LocalProduto>,
  ) {}

  async cadastrar(
    dto: CriarProdutoDto,
    usuarioId: number,
  ): Promise<ProdutoPublico> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const produto = await manager.save(Produto, {
          nome: dto.nome,
          codigo: dto.codigo,
          descricao: dto.descricao,
          categoriaId: dto.categoriaId,
          unidadeEstoqueId: dto.unidadeEstoqueId,
          unidadeConteudoId: dto.unidadeConteudoId,
          quantidadeConteudo: dto.quantidadeConteudo?.toString(),
          perecivel: dto.perecivel,
          precoVendaAtual: dto.precoVendaAtual.toString(),
          estoqueMinimo: dto.estoqueMinimo?.toString(),
          usuarioId,
        });

        await manager.save(EstoqueProduto, { produtoId: produto.id });

        await manager.save(Lote, {
          codigoLote: dto.primeiroLote.codigoLote,
          dataFabricacao: dto.primeiroLote.dataFabricacao,
          dataVencimento: dto.primeiroLote.dataVencimento,
          produtoId: produto.id,
          usuarioId,
        });

        for (const localId of dto.locaisIds) {
          await manager.save(LocalProduto, {
            localId,
            produtoId: produto.id,
            usuarioId,
          });
        }

        return {
          id: produto.id,
          nome: produto.nome,
          codigo: produto.codigo,
          ativo: produto.ativo,
        };
      });
    } catch (erro) {
      if (erro instanceof QueryFailedError) {
        const codigo = (erro.driverError as { code?: string }).code;
        if (codigo === '23505') {
          throw new CodigoDuplicadoError();
        }
        if (codigo === '23503') {
          throw new ReferenciaInexistenteError();
        }
      }
      throw erro;
    }
  }

  async listar(
    filtros: FiltrarProdutosDto,
  ): Promise<[ProdutoListagem[], number]> {
    const {
      pagina,
      limite,
      nome,
      categoriaId,
      ativo,
      precoMinimo,
      precoMaximo,
      destaque,
    } = filtros;

    const consulta = this.dataSource
      .createQueryBuilder(Produto, 'p')
      .innerJoin(EstoqueProduto, 'ep', 'ep.produtoId = p.id')
      .innerJoin(Categoria, 'c', 'c.id = p.categoriaId');

    if (nome) {
      consulta.andWhere('p.nome ilike :nome', { nome: `%${nome}%` });
    }
    if (categoriaId !== undefined) {
      consulta.andWhere('p.categoriaId = :categoriaId', { categoriaId });
    }
    if (ativo !== undefined) {
      consulta.andWhere('p.ativo = :ativo', { ativo });
    }
    if (precoMinimo !== undefined) {
      consulta.andWhere('p.precoVendaAtual >= :precoMinimo', { precoMinimo });
    }
    if (precoMaximo !== undefined) {
      consulta.andWhere('p.precoVendaAtual <= :precoMaximo', { precoMaximo });
    }
    if (destaque === 'ESTOQUE_BAIXO') {
      consulta.andWhere(SQL_ESTOQUE_BAIXO);
    }
    if (destaque === 'VENCENDO') {
      consulta.andWhere(SQL_PROXIMO_DO_VENCIMENTO);
    }

    const total = await consulta.getCount();

    const dados = await consulta
      .select('p.id', 'id')
      .addSelect('p.codigo', 'codigo')
      .addSelect('p.nome', 'nome')
      .addSelect('c.nome', 'categoriaNome')
      .addSelect('p.precoVendaAtual', 'precoVendaAtual')
      .addSelect('p.ativo', 'ativo')
      .addSelect('p.perecivel', 'perecivel')
      .addSelect('ep.quantidadeTotal', 'quantidadeTotal')
      .addSelect('p.estoqueMinimo', 'estoqueMinimo')
      .addSelect(SQL_ESTOQUE_BAIXO, 'estoqueBaixo')
      .addSelect(SQL_PROXIMO_DO_VENCIMENTO, 'proximoDoVencimento')
      .orderBy('p.nome', 'ASC')
      .offset((pagina - 1) * limite)
      .limit(limite)
      .getRawMany<ProdutoListagem>();

    return [dados, total];
  }

  async existe(id: number): Promise<boolean> {
    return this.repository.exists({ where: { id } });
  }

  async atualizar(id: number, dto: AtualizarProdutoDto): Promise<void> {
    try {
      await this.repository.update(id, {
        nome: dto.nome,
        descricao: dto.descricao,
        precoVendaAtual: dto.precoVendaAtual?.toString(),
        categoriaId: dto.categoriaId,
        estoqueMinimo: dto.estoqueMinimo?.toString(),
        ativo: dto.ativo,
      });
    } catch (erro) {
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23503'
      ) {
        throw new CategoriaInexistenteError();
      }
      throw erro;
    }
  }

  async buscarPublico(id: number): Promise<ProdutoPublico> {
    return this.repository.findOneOrFail({
      where: { id },
      select: CAMPOS_PUBLICOS,
    });
  }

  async buscarDetalhe(id: number): Promise<ProdutoDetalhe | null> {
    return this.repository.findOne({
      where: { id },
      select: {
        id: true,
        codigo: true,
        nome: true,
        descricao: true,
        precoVendaAtual: true,
        categoriaId: true,
        estoqueMinimo: true,
        perecivel: true,
        ativo: true,
      },
    });
  }

  async listarLotes(produtoId: number): Promise<Lote[]> {
    return this.lotesRepository.find({
      where: { produtoId },
      select: {
        id: true,
        codigoLote: true,
        dataFabricacao: true,
        dataVencimento: true,
      },
      order: { dataVencimento: 'ASC' },
    });
  }

  async listarLocais(produtoId: number): Promise<Local[]> {
    const associacoes = await this.localProdutosRepository.find({
      where: { produtoId },
      select: { localId: true },
    });
    const ids = associacoes.map((a) => a.localId);
    if (ids.length === 0) {
      return [];
    }
    return this.locaisRepository.find({
      where: { id: In(ids) },
      select: { id: true, corredor: true, prateleira: true, secao: true },
      order: { corredor: 'ASC', prateleira: 'ASC', secao: 'ASC' },
    });
  }
}
