import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';
import type { Paginado } from '../common/interface/paginado.interface.js';
import { EstoqueRepository } from './estoque.repository.js';
import type { EstoqueDetalhe, EstoqueResumo } from './estoque.interface.js';

@Injectable()
export class EstoqueService {
  constructor(private readonly estoqueRepository: EstoqueRepository) {}

  async listar(paginacao: PaginacaoDto): Promise<Paginado<EstoqueResumo>> {
    const { pagina, limite } = paginacao;

    const [dados, total] = await this.estoqueRepository.listar(pagina, limite);

    return { dados, total, pagina, limite };
  }

  async detalhar(produtoId: number): Promise<EstoqueDetalhe> {
    const produto = await this.estoqueRepository.buscarProduto(produtoId);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado.');
    }

    const [saldo, posicoes] = await Promise.all([
      this.estoqueRepository.buscarSaldoTotal(produtoId),
      this.estoqueRepository.listarPosicoes(produtoId),
    ]);

    return {
      produtoId: produto.id,
      codigo: produto.codigo,
      nome: produto.nome,
      ativo: produto.ativo,
      quantidadeTotal: saldo.quantidadeTotal,
      estoqueMinimo: produto.estoqueMinimo,
      posicoes,
    };
  }
}
