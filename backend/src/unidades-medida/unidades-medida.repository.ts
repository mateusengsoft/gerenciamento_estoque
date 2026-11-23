import { Injectable } from '@nestjs/common';
import { UnidadeMedida } from './unidade-medida.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UnidadesMedidaRepository {
  constructor(
    @InjectRepository(UnidadeMedida)
    private readonly repository: Repository<UnidadeMedida>,
  ) {}
  async listar(): Promise<UnidadeMedida[]> {
    return this.repository.find({
      order: { nome: 'ASC' },
      select: { id: true, nome: true, sigla: true },
    });
  }
}
