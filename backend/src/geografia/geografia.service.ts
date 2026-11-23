import { Injectable, NotFoundException } from '@nestjs/common';
import { Estado } from './estado.entity.js';

import { Bairro } from './bairro.entity.js';
import { Municipio } from './municipio.entity.js';
import { EstadosRepository } from './estados.repository.js';
import { BairrosRepository } from './bairros.repository.js';
import { MunicipiosRepository } from './municipios.repository.js';

@Injectable()
export class GeografiaService {
  constructor(
    private readonly estadosRepository: EstadosRepository,

    private readonly bairrosRepository: BairrosRepository,

    private readonly municipiosRepository: MunicipiosRepository,
  ) {}

  async listarEstados(): Promise<Estado[]> {
    return this.estadosRepository.listar();
  }

  async listarMunicipiosPorEstado(estadoId: number): Promise<Municipio[]> {
    const estadoExiste = await this.estadosRepository.existe(estadoId);

    if (!estadoExiste) {
      throw new NotFoundException('Estado não encontrado.');
    }
    return this.municipiosRepository.listarPorEstado(estadoId);
  }

  async listarBairrosPorMunicipio(municipioId: number): Promise<Bairro[]> {
    const municipioExiste = await this.municipiosRepository.existe(municipioId);
    if (!municipioExiste) {
      throw new NotFoundException('Município não encontrado.');
    }

    return this.bairrosRepository.listarPorMunicipio(municipioId);
  }
}
