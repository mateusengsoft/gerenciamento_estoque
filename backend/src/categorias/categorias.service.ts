import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './categoria.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriasRepository: Repository<Categoria>,
  ) {}

  async listar(): Promise<Categoria[]> {
    const categorias = await this.categoriasRepository.find({
      order: { nome: 'ASC' },
    });
    return categorias;
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
