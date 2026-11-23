import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './categoria.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasRepository {
  constructor(
    @InjectRepository(Categoria)
    private readonly repository: Repository<Categoria>,
  ) {}

  async listar(pagina: number, limite: number): Promise<[Categoria[], number]> {
    return this.repository.findAndCount({
      skip: (pagina - 1) * limite,
      take: limite,
      order: { nome: 'ASC' },
    });
  }

  async buscarPorId(id: number): Promise<Categoria | null> {
    return this.repository.findOneBy({ id });
  }
}
