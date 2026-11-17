import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Produto } from './produto.entity.js';
import { CriarProdutoDto } from './dto/criar-produto.dto.js';
import type { ProdutoPublico } from './produto-publico.interface.js';
import { EstoqueProduto } from './estoque-produto.entity.js';
import { Lote } from './lote.entity.js';
import { LocalProduto } from './local-produto.entity.js';
import { Categoria } from '../categorias/categoria.entity.js';
import { FiltrarProdutosDto } from './dto/filtrar-produtos.dto.js';
import { Paginado } from '../common/interface/paginado.interface.js';
import { ProdutoListagem } from './produto-listagem.interface.js';
import { AtualizarProdutoDto } from './dto/atualizar-produto.dto.js';

const SQL_ESTOQUE_BAIXO = 'ep.quantidade_total < p.estoque_minimo';

const SQL_PROXIMO_DO_VENCIMENTO = `exists (
  select 1
  from lotes l2
  join estoques_atuais ea on ea.lote_id = l2.id
  where l2.produto_id = p.id
    and ea.quantidade > 0
    and l2.data_vencimento <= current_date + 30
)`;

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtosRepository: Repository<Produto>,
    private readonly dataSource: DataSource,
  ) {}

  async cadastrar(
    dto: CriarProdutoDto,
    usuarioId: number,
  ): Promise<ProdutoPublico> {
    if (dto.perecivel && !dto.primeiroLote.dataVencimento) {
      throw new BadRequestException(
        'Produtos perecíveis precisam da data de vencimento do lote',
      );
    }

    if (
      (dto.quantidadeConteudo && !dto.unidadeConteudoId) ||
      (!dto.quantidadeConteudo && dto.unidadeConteudoId)
    ) {
      throw new BadRequestException(
        'Quantidade e unidade de conteúdo devem ser informados juntos.',
      );
    }

    const { dataFabricacao, dataVencimento } = dto.primeiroLote;

    if (dataVencimento && dataVencimento <= dataFabricacao) {
      throw new BadRequestException(
        'A data de vencimento deve ser posterior à de fabricação.',
      );
    }

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
          usuarioId: usuarioId,
        });

        await manager.save(EstoqueProduto, {
          produtoId: produto.id,
        });

        await manager.save(Lote, {
          codigoLote: dto.primeiroLote.codigoLote,
          dataFabricacao: dto.primeiroLote.dataFabricacao,
          dataVencimento: dto.primeiroLote.dataVencimento,
          produtoId: produto.id,
          usuarioId: usuarioId,
        });

        for (const localId of dto.locaisIds) {
          await manager.save(LocalProduto, {
            localId,
            produtoId: produto.id,
            usuarioId: usuarioId,
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
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Código de produto já cadastrado.');
      }
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23503'
      ) {
        throw new BadRequestException(
          'Categoria, unidade de medida ou local informado não existe.',
        );
      }
      throw erro;
    }
  }

  async listar(
    filtros: FiltrarProdutosDto,
  ): Promise<Paginado<ProdutoListagem>> {
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

    if (
      precoMinimo !== undefined &&
      precoMaximo !== undefined &&
      precoMinimo > precoMaximo
    ) {
      throw new BadRequestException(
        'O preço mínimo não pode ser maior que o máximo.',
      );
    }

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

    return { dados, total, pagina, limite };
  }

  async atualizar(
    id: number,
    dto: AtualizarProdutoDto,
  ): Promise<ProdutoPublico> {
    const nenhumCampo = Object.values(dto).every(
      (valor) => valor === undefined,
    );
    if (nenhumCampo) {
      throw new BadRequestException(
        'Informe ao menos um campo para atualizar.',
      );
    }

    const existe = await this.produtosRepository.exists({ where: { id } });
    if (!existe) {
      throw new NotFoundException('Produto não encontrado.');
    }

    try {
      await this.produtosRepository.update(id, {
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
        throw new BadRequestException('Categoria informada não existe.');
      }
      throw erro;
    }

    return await this.produtosRepository.findOneOrFail({
      where: { id },
      select: { id: true, nome: true, codigo: true, ativo: true },
    });
  }
}
