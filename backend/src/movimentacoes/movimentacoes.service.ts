import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { CriarEntradaDto } from './dto/criar-entrada.dto.js';
import { Produto } from '../produtos/produto.entity.js';
import { Lote } from '../produtos/lote.entity.js';
import { LocalProduto } from '../produtos/local-produto.entity.js';
import { Fornecedor } from '../fornecedores/fornecedor.entity.js';
import { Aquisicao } from './aquisicao.entity.js';
import { MovimentacaoEstoque } from './movimentacao-estoque.entity.js';
import { TipoMovimentacao } from './tipo-movimentacao.enum.js';
import { MotivoMovimentacao } from './motivo-movimentacao.enum.js';

@Injectable()
export class MovimentacoesService {
  constructor(private readonly dataSource: DataSource) {}

  async registrarEntrada(dto: CriarEntradaDto, usuarioId: number) {
    if ((dto.loteId && dto.novoLote) || (!dto.loteId && !dto.novoLote)) {
      throw new BadRequestException(
        'Informe um lote existente ou um lote novo (apenas um dos dois).',
      );
    }

    if (new Date(dto.dataMovimentacao) > new Date()) {
      throw new BadRequestException(
        'A data da movimentação não pode estar no futuro.',
      );
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const produto = await manager.findOne(Produto, {
          where: { id: dto.produtoId },
          select: { id: true, ativo: true, perecivel: true },
        });
        if (!produto) {
          throw new BadRequestException('Produto informado não existe.');
        }
        if (!produto.ativo) {
          throw new BadRequestException(
            'Produto inativo não pode receber movimentações.',
          );
        }

        const fornecedor = await manager.findOne(Fornecedor, {
          where: { id: dto.fornecedorId },
          select: { id: true, ativo: true },
        });
        if (!fornecedor || !fornecedor.ativo) {
          throw new BadRequestException('Fornecedor inexistente ou inativo.');
        }

        const localAutorizado = await manager.exists(LocalProduto, {
          where: { produtoId: dto.produtoId, localId: dto.localDestinoId },
        });
        if (!localAutorizado) {
          throw new BadRequestException(
            'Este local não está autorizado para o produto.',
          );
        }

        let loteId: number;

        if (dto.loteId) {
          const loteDoProduto = await manager.exists(Lote, {
            where: { id: dto.loteId, produtoId: dto.produtoId },
          });
          if (!loteDoProduto) {
            throw new BadRequestException(
              'O lote informado não pertence ao produto.',
            );
          }
          loteId = dto.loteId;
        } else {
          const novoLote = dto.novoLote!;
          if (produto.perecivel && !novoLote.dataVencimento) {
            throw new BadRequestException(
              'Produtos perecíveis precisam da data de vencimento do lote.',
            );
          }
          if (
            novoLote.dataVencimento &&
            novoLote.dataVencimento <= novoLote.dataFabricacao
          ) {
            throw new BadRequestException(
              'A data de vencimento deve ser posterior à de fabricação.',
            );
          }
          const lote = await manager.save(Lote, {
            ...novoLote,
            produtoId: dto.produtoId,
            usuarioId,
          });
          loteId = lote.id;
        }

        const aquisicao = await manager.save(Aquisicao, {
          codigoAquisicao: dto.codigoAquisicao,
          fornecedorId: dto.fornecedorId,
          loteId,
          quantidade: dto.quantidade.toString(),
          valorUnitario: dto.valorUnitario.toString(),
          dataAquisicao: new Date(dto.dataMovimentacao),
          usuarioId,
        });

        const movimentacao = await manager.save(MovimentacaoEstoque, {
          tipoMovimentacao: TipoMovimentacao.ENTRADA,
          motivo: MotivoMovimentacao.COMPRA,
          quantidade: dto.quantidade.toString(),
          dataMovimentacao: new Date(dto.dataMovimentacao),
          valorUnitario: dto.valorUnitario.toString(),
          loteId,
          aquisicaoId: aquisicao.id,
          localDestinoId: dto.localDestinoId,
          usuarioId,
          observacao: dto.observacao,
        });

        await manager.query(
          `insert into estoques_atuais (lote_id, local_id, quantidade)
           values ($1, $2, $3)
           on conflict (lote_id, local_id)
           do update set quantidade = estoques_atuais.quantidade + excluded.quantidade`,
          [loteId, dto.localDestinoId, dto.quantidade],
        );

        await manager.query(
          `update estoques_produtos
           set quantidade_total = quantidade_total + $1
           where produto_id = $2`,
          [dto.quantidade, dto.produtoId],
        );

        return {
          movimentacaoId: movimentacao.id,
          aquisicaoId: aquisicao.id,
          loteId,
        };
      });
    } catch (erro) {
      if (erro instanceof QueryFailedError) {
        const { code, constraint } = erro.driverError as {
          code?: string;
          constraint?: string;
        };

        if (
          code === '23505' &&
          constraint === 'uq_lotes_produto_id_codigo_lote'
        ) {
          throw new ConflictException(
            'Já existe um lote com este código para o produto.',
          );
        }
        if (code === '23505') {
          throw new ConflictException(
            'Esta aquisição já foi registrada para este fornecedor e lote.',
          );
        }
      }
      throw erro;
    }
  }
}
