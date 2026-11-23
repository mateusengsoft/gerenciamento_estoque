import { Injectable } from '@nestjs/common';
import { UnidadeMedida } from './unidade-medida.entity.js';
import { UnidadesMedidaRepository } from './unidades-medida.repository.js';

@Injectable()
export class UnidadesMedidaService {
  constructor(
    private readonly unidadesMedidaRepository: UnidadesMedidaRepository,
  ) {}

  async listar(): Promise<UnidadeMedida[]> {
    return this.unidadesMedidaRepository.listar();
  }
}
