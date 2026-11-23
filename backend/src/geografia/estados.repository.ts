import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from './estado.entity.js';

@Injectable()
export class EstadosRepository {
  constructor(
    @InjectRepository(Estado)
    private readonly repository: Repository<Estado>,
  ) {}

  async listar(): Promise<Estado[]> {
    return this.repository.find({
      select: { id: true, nome: true, uf: true },

      order: { nome: 'ASC' },
    });
  }

  async existe(estadoId: number): Promise<boolean> {
    return this.repository.exists({
      where: { id: estadoId },
    });
  }
}
