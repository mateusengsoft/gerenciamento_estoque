import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Produto } from './produto.entity.js';
import { CriarProdutoDto } from './dto/criar-produto.dto.js';
import type { ProdutoPublico } from './produto-publico.interface.js';
import { EstoqueProduto } from './estoque-produto.entity.js';
import { Lote } from './lote.entity.js';
import { LocalProduto } from './local-produto.entity.js';

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
}
