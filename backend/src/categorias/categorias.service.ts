import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './categoria.entity.js';
import { Repository } from 'typeorm';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';
import type { Paginado } from '../common/interface/paginado.interface.js';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepository: Repository<Categoria>,
  ) {}

  async listar(paginacao: PaginacaoDto): Promise<Paginado<Categoria>> {
    const { pagina, limite } = paginacao;
    const [categorias, total] = await this.categoriasRepository.findAndCount({
      skip: (pagina - 1) * limite,
      take: limite,
      order: { nome: 'ASC' },
    });
    return {
      dados: categorias,
      total,
      pagina,
      limite,
    };
  }

  async buscarPorId(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.findOneBy({ id });
    if (!categoria) {
      throw new NotFoundException(
        `A categoria com o ID ${id} não foi encontrada.`,
      );
    }
    return categoria;
  }
}
