import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CriarEntradaDto } from './dto/criar-entrada.dto.js';
import { CriarSaidaDto } from './dto/criar-saida.dto.js';
import { FiltrarMovimentacoesDto } from './dto/filtrar-movimentacoes.dto.js';
import { MotivoMovimentacao } from './motivo-movimentacao.enum.js';
import type { MovimentacaoHistorico } from './movimentacao-historico.interface.js';
import type { Paginado } from '../common/interface/paginado.interface.js';
import { MovimentacoesRepository } from './movimentacoes.repository.js';
import {
  AquisicaoDuplicadaError,
  LoteDuplicadoError,
  RegraMovimentacaoError,
  SaldoInconsistenteError,
  SaldoInsuficienteError,
} from './movimentacoes.errors.js';

// 'AAAA-MM-DD' sozinho é lido como meia-noite em UTC (21h do dia anterior no Brasil).
// Com o 'T00:00:00' e sem o 'Z', o JavaScript lê como meia-noite no horário local.
const paraDataLocal = (valor: string): Date =>
  new Date(/^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T00:00:00` : valor);

@Injectable()
export class MovimentacoesService {
  constructor(
    private readonly movimentacoesRepository: MovimentacoesRepository,
  ) {}

  async registrarEntrada(dto: CriarEntradaDto, usuarioId: number) {
    if ((dto.loteId && dto.novoLote) || (!dto.loteId && !dto.novoLote)) {
      throw new BadRequestException(
        'Informe um lote existente ou um lote novo (apenas um dos dois).',
      );
    }

    const data = this.validarData(dto.dataMovimentacao);

    if (
      dto.novoLote?.dataVencimento &&
      dto.novoLote.dataVencimento <= dto.novoLote.dataFabricacao
    ) {
      throw new BadRequestException(
        'A data de vencimento deve ser posterior à de fabricação.',
      );
    }

    try {
      return await this.movimentacoesRepository.registrarEntrada(
        dto,
        usuarioId,
        data,
      );
    } catch (erro) {
      this.traduzirErro(erro);
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

    const data = this.validarData(dto.dataMovimentacao);

    try {
      return await this.movimentacoesRepository.registrarSaida(
        dto,
        usuarioId,
        data,
      );
    } catch (erro) {
      this.traduzirErro(erro);
    }
  }

  async listarHistorico(
    filtros: FiltrarMovimentacoesDto,
  ): Promise<Paginado<MovimentacaoHistorico>> {
    const {
      pagina,
      limite,
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

    const [dados, total] =
      await this.movimentacoesRepository.listarHistorico(filtros);
    return { dados, total, pagina, limite };
  }

  
   private validarData(valor: string): Date {
    const data = paraDataLocal(valor);
    const agora = new Date();
    if (data > agora) {
      throw new BadRequestException(
        'A data da movimentação não pode estar no futuro.',
      );
    }

    const soData = /^\d{4}-\d{2}-\d{2}$/.test(valor);
    if (soData && data.toDateString() === agora.toDateString()) {
      return agora;
    }
    return data;
  }

  
  private traduzirErro(erro: unknown): never {
    if (erro instanceof SaldoInsuficienteError) {
      throw new UnprocessableEntityException(erro.message);
    }
    if (
      erro instanceof LoteDuplicadoError ||
      erro instanceof AquisicaoDuplicadaError
    ) {
      throw new ConflictException(erro.message);
    }
    if (erro instanceof SaldoInconsistenteError) {
      throw new InternalServerErrorException(erro.message);
    }
    if (erro instanceof RegraMovimentacaoError) {
      throw new BadRequestException(erro.message);
    }
    throw erro;
  }
}
