import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadeMedida } from './unidade-medida.entity.js';

@Injectable()
export class UnidadesMedidaService {
  constructor(
    @InjectRepository(UnidadeMedida)
    private readonly unidadesMedidaRepository: Repository<UnidadeMedida>,
  ) {}

  async listar(): Promise<UnidadeMedida[]> {
    const unidadesMedida = await this.unidadesMedidaRepository.find({
      order: { nome: 'ASC' },
      select: { id: true, nome: true, sigla: true },
    });

    return unidadesMedida;
  }
}
