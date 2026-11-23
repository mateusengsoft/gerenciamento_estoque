
import { Injectable, NotFoundException } from '@nestjs/common';
import { Categoria } from './categoria.entity.js';
import { CategoriasRepository } from './categorias.repository.js';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';
import type { Paginado } from '../common/interface/paginado.interface.js';

@Injectable()
export class CategoriasService {
  constructor(
    private readonly categoriasRepository: CategoriasRepository,
  ) {}

  async listar(
    paginacao: PaginacaoDto,
  ): Promise<Paginado<Categoria>> {
    const { pagina, limite } = paginacao;

    const [categorias, total] =
      await this.categoriasRepository.listar(pagina, limite);

    return {
      dados: categorias,
      total,
      pagina,
      limite,
    };
  }

  async buscarPorId(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.buscarPorId(id);

    if (!categoria) {
      throw new NotFoundException(
        `A categoria com o ID ${id} não foi encontrada.`,
      );
    }

    return categoria;
  }
}
