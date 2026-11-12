import { Injectable, NotFoundException } from '@nestjs/common';
import { Estado } from './estado.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Bairro } from './bairro.entity.js';
import { Municipio } from './municipio.entity.js';

@Injectable()
export class GeografiaService {
  constructor(
    @InjectRepository(Estado)
    private readonly estadosRepository: Repository<Estado>,

    @InjectRepository(Bairro)
    private readonly bairrosRepository: Repository<Bairro>,

    @InjectRepository(Municipio)
    private readonly municipiosRepository: Repository<Municipio>,
  ) {}

  async listarEstados(): Promise<Estado[]> {
    return this.estadosRepository.find({
      select: { id: true, nome: true, uf: true },
      order: { nome: 'ASC' },
    });
  }

  async listarMunicipiosPorEstado(estadoId: number): Promise<Municipio[]> {
    const estadoExiste = await this.estadosRepository.exists({
      where: { id: estadoId },
    });

    if (!estadoExiste) {
      throw new NotFoundException('Estado não encontrado.');
    }
    return this.municipiosRepository.find({
      where: { estadoId },
      select: { id: true, nome: true },
      order: { nome: 'ASC' },
    });
  }

  async listarBairrosPorMunicipio(municipioId: number): Promise<Bairro[]> {
    const municipioExiste = await this.municipiosRepository.exists({
      where: { id: municipioId },
    });
    if (!municipioExiste) {
      throw new NotFoundException('Município não encontrado.');
    }

    return this.bairrosRepository.find({
      where: { municipioId },
      select: { id: true, nome: true },
      order: { nome: 'ASC' },
    });
  }
}
