import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
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
import { MovimentacaoAquisicao } from './movimentacao-aquisicao.entity.js';
import { CriarSaidaDto } from './dto/criar-saida.dto.js';
import { FiltrarMovimentacoesDto } from './dto/filtrar-movimentacoes.dto.js';
import { MovimentacaoHistorico } from './movimentacao-historico.interface.js';
import { Paginado } from '../common/interface/paginado.interface.js';
import { Usuario } from '../usuarios/usuario.entity.js';

// Converte uma quantidade para milésimos inteiros (15.5 → 15500),
// para fazer as contas sem os erros de arredondamento do number.
const paraMilesimos = (valor: number | string): number =>
  Math.round(Number(valor) * 1000);

// Converte de volta para o formato do numeric(10,3) (15500 → '15.500').
const deMilesimos = (milesimos: number): string =>
  (milesimos / 1000).toFixed(3);

const paraDataLocal = (valor: string): Date =>
  new Date(/^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T00:00:00` : valor);

@Injectable()
export class MovimentacoesService {
  constructor(private readonly dataSource: DataSource) {}

  async registrarEntrada(dto: CriarEntradaDto, usuarioId: number) {
    if ((dto.loteId && dto.novoLote) || (!dto.loteId && !dto.novoLote)) {
      throw new BadRequestException(
        'Informe um lote existente ou um lote novo (apenas um dos dois).',
      );
    }

    if (paraDataLocal(dto.dataMovimentacao) > new Date()) {
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
          dataAquisicao: paraDataLocal(dto.dataMovimentacao),
          usuarioId,
        });

        const movimentacao = await manager.save(MovimentacaoEstoque, {
          tipoMovimentacao: TipoMovimentacao.ENTRADA,
          motivo: MotivoMovimentacao.COMPRA,
          quantidade: dto.quantidade.toString(),
          dataMovimentacao: paraDataLocal(dto.dataMovimentacao),
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

  async registrarSaida(dto: CriarSaidaDto, usuarioId: number) {
    const ehVenda = dto.motivo === MotivoMovimentacao.VENDA;

    if (ehVenda && dto.valorUnitario === undefined) {
      throw new BadRequestException('Informe o valor unitário da venda.');
    }
    if (!ehVenda && dto.valorUnitario !== undefined) {
      throw new BadRequestException(
        'Perdas e vencimentos não têm valor unitário.',
      );
    }
    if (paraDataLocal(dto.dataMovimentacao) > new Date()) {
      throw new BadRequestException(
        'A data da movimentação não pode estar no futuro.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const [saldo]: { quantidade: string; suficiente: boolean }[] =
        await manager.query(
          `select quantidade, quantidade >= $3 as suficiente
       from estoques_atuais
       where lote_id = $1 and local_id = $2
       for update`,
          [dto.loteId, dto.localOrigemId, dto.quantidade],
        );
      if (!saldo || !saldo.suficiente) {
        throw new UnprocessableEntityException(
          `Saldo insuficiente. Disponível: ${saldo?.quantidade ?? '0'}.`,
        );
      }

      const lote = await manager.findOneOrFail(Lote, {
        where: { id: dto.loteId },
        select: { id: true, produtoId: true },
      });
      const produto = await manager.findOneOrFail(Produto, {
        where: { id: lote.produtoId },
        select: { id: true, ativo: true },
      });
      if (!produto.ativo) {
        throw new BadRequestException(
          'Produto inativo não pode receber movimentações.',
        );
      }

      const movimentacao = await manager.save(MovimentacaoEstoque, {
        tipoMovimentacao: TipoMovimentacao.SAIDA,
        motivo: dto.motivo,
        quantidade: dto.quantidade.toString(),
        dataMovimentacao: paraDataLocal(dto.dataMovimentacao),
        valorUnitario: dto.valorUnitario?.toString(),
        loteId: dto.loteId,
        localOrigemId: dto.localOrigemId,
        usuarioId,
        observacao: dto.observacao,
      });

      const origens: {
        entrada_id: number;
        aquisicao_id: number;
        disponivel: string;
      }[] = await manager.query(
        `select me.id as entrada_id,
                me.aquisicao_id,
                me.quantidade - coalesce(sum(ma.quantidade), 0) as disponivel
         from movimentacoes_estoque me
         left join movimentacoes_aquisicoes ma
                on ma.movimentacao_disponibilizacao_id = me.id
         where me.tipo_movimentacao = 'ENTRADA'
           and me.lote_id = $1
           and me.local_destino_id = $2
         group by me.id
         having me.quantidade - coalesce(sum(ma.quantidade), 0) > 0
         order by me.data_criacao, me.id`,
        [dto.loteId, dto.localOrigemId],
      );

      let restante = paraMilesimos(dto.quantidade);

      for (const origem of origens) {
        if (restante === 0) {
          break;
        }
        const consumir = Math.min(restante, paraMilesimos(origem.disponivel));

        await manager.save(MovimentacaoAquisicao, {
          movimentacaoId: movimentacao.id,
          aquisicaoId: origem.aquisicao_id,
          movimentacaoDisponibilizacaoId: origem.entrada_id,
          quantidade: deMilesimos(consumir),
        });

        restante -= consumir;
      }

      if (restante > 0) {
        throw new InternalServerErrorException(
          'O saldo do lote não confere com o histórico de entradas.',
        );
      }

      await manager.query(
        `update estoques_atuais
       set quantidade = quantidade - $3
       where lote_id = $1 and local_id = $2`,
        [dto.loteId, dto.localOrigemId, dto.quantidade],
      );
      await manager.query(
        `update estoques_produtos
       set quantidade_total = quantidade_total - $1
       where produto_id = $2`,
        [dto.quantidade, lote.produtoId],
      );

      return { movimentacaoId: movimentacao.id };
    });
  }
  async listarHistorico(
    filtros: FiltrarMovimentacoesDto,
  ): Promise<Paginado<MovimentacaoHistorico>> {
    const {
      pagina,
      limite,
      produtoId,
      tipo,
      motivo,
      usuarioId,
      quantidadeMinima,
      quantidadeMaxima,
      dataInicio,
      dataFim,
    } = filtros;

    if (
      quantidadeMinima !== undefined &&
      quantidadeMaxima !== undefined &&
      quantidadeMinima > quantidadeMaxima
    ) {
      throw new BadRequestException(
        'A quantidade mínima não pode ser maior que a máxima.',
      );
    }
    if (dataInicio && dataFim && dataInicio > dataFim) {
      throw new BadRequestException(
        'A data inicial não pode ser depois da data final.',
      );
    }

    const consulta = this.dataSource
      .createQueryBuilder(MovimentacaoEstoque, 'me')
      .innerJoin(Lote, 'l', 'l.id = me.loteId')
      .innerJoin(Produto, 'p', 'p.id = l.produtoId')
      .innerJoin(Usuario, 'u', 'u.id = me.usuarioId');

    if (produtoId !== undefined) {
      consulta.andWhere('l.produtoId = :produtoId', { produtoId });
    }
    if (tipo) {
      consulta.andWhere('me.tipoMovimentacao = :tipo', { tipo });
    }
    if (motivo) {
      consulta.andWhere('me.motivo = :motivo', { motivo });
    }
    if (usuarioId !== undefined) {
      consulta.andWhere('me.usuarioId = :usuarioId', { usuarioId });
    }
    if (quantidadeMinima !== undefined) {
      consulta.andWhere('me.quantidade >= :quantidadeMinima', {
        quantidadeMinima,
      });
    }
    if (quantidadeMaxima !== undefined) {
      consulta.andWhere('me.quantidade <= :quantidadeMaxima', {
        quantidadeMaxima,
      });
    }
    if (dataInicio) {
      consulta.andWhere('me.dataMovimentacao >= cast(:dataInicio as date)', {
        dataInicio,
      });
    }
    if (dataFim) {
      consulta.andWhere('me.dataMovimentacao < cast(:dataFim as date) + 1', {
        dataFim,
      });
    }

    const total = await consulta.getCount();

    const dados = await consulta
      .select('me.id', 'id')
      .addSelect('me.tipoMovimentacao', 'tipo')
      .addSelect('me.motivo', 'motivo')
      .addSelect('me.quantidade', 'quantidade')
      .addSelect('me.valorUnitario', 'valorUnitario')
      .addSelect('me.dataMovimentacao', 'dataMovimentacao')
      .addSelect('me.observacao', 'observacao')
      .addSelect('p.id', 'produtoId')
      .addSelect('p.nome', 'produtoNome')
      .addSelect('l.id', 'loteId')
      .addSelect('l.codigoLote', 'codigoLote')
      .addSelect('u.nome', 'usuarioNome')
      .addSelect('me.localOrigemId', 'localOrigemId')
      .addSelect('me.localDestinoId', 'localDestinoId')
      .orderBy('me.dataMovimentacao', 'DESC')
      .addOrderBy('me.id', 'DESC')
      .offset((pagina - 1) * limite)
      .limit(limite)
      .getRawMany<MovimentacaoHistorico>();

    return { dados, total, pagina, limite };
  }
}
