import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CriarProdutoDto } from './dto/criar-produto.dto.js';
import { FiltrarProdutosDto } from './dto/filtrar-produtos.dto.js';
import { AtualizarProdutoDto } from './dto/atualizar-produto.dto.js';
import type { Paginado } from '../common/interface/paginado.interface.js';
import type { ProdutoPublico } from './produto-publico.interface.js';
import type { ProdutoListagem } from './produto-listagem.interface.js';
import type { ProdutoDetalhe } from './produto-detalhe.interface.js';
import { Lote } from './lote.entity.js';
import { Local } from '../locais/local.entity.js';
import { ProdutosRepository } from './produtos.repository.js';
import {
  CategoriaInexistenteError,
  CodigoDuplicadoError,
  ReferenciaInexistenteError,
} from './produtos.errors.js';

@Injectable()
export class ProdutosService {
  constructor(private readonly produtosRepository: ProdutosRepository) {}

  async cadastrar(
    dto: CriarProdutoDto,
    usuarioId: number,
  ): Promise<ProdutoPublico> {
    if (dto.perecivel && !dto.primeiroLote.dataVencimento) {
      throw new BadRequestException(
        'Produtos perecíveis precisam da data de vencimento do lote.',
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
      return await this.produtosRepository.cadastrar(dto, usuarioId);
    } catch (erro) {
      if (erro instanceof CodigoDuplicadoError) {
        throw new ConflictException(erro.message);
      }
      if (erro instanceof ReferenciaInexistenteError) {
        throw new BadRequestException(erro.message);
      }
      throw erro;
    }
  }

  async listar(
    filtros: FiltrarProdutosDto,
  ): Promise<Paginado<ProdutoListagem>> {
    const { pagina, limite, precoMinimo, precoMaximo } = filtros;

    if (
      precoMinimo !== undefined &&
      precoMaximo !== undefined &&
      precoMinimo > precoMaximo
    ) {
      throw new BadRequestException(
        'O preço mínimo não pode ser maior que o máximo.',
      );
    }

    const [dados, total] = await this.produtosRepository.listar(filtros);
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

    await this.garantirQueExiste(id);

    try {
      await this.produtosRepository.atualizar(id, dto);
    } catch (erro) {
      if (erro instanceof CategoriaInexistenteError) {
        throw new BadRequestException(erro.message);
      }
      throw erro;
    }

    return this.produtosRepository.buscarPublico(id);
  }

  async listarLotes(id: number): Promise<Lote[]> {
    await this.garantirQueExiste(id);
    return this.produtosRepository.listarLotes(id);
  }

  async listarLocais(id: number): Promise<Local[]> {
    await this.garantirQueExiste(id);
    return this.produtosRepository.listarLocais(id);
  }

  async detalhar(id: number): Promise<ProdutoDetalhe> {
    const produto = await this.produtosRepository.buscarDetalhe(id);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }
    return produto;
  }

  private async garantirQueExiste(id: number): Promise<void> {
    if (!(await this.produtosRepository.existe(id))) {
      throw new NotFoundException('Produto não encontrado.');
    }
  }
}
