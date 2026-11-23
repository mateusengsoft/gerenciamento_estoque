import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Municipio } from './municipio.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class MunicipiosRepository {
  constructor(
    @InjectRepository(Municipio)
    private readonly repository: Repository<Municipio>,
  ) {}

  async listarPorEstado(estadoId: number): Promise<Municipio[]> {
    return this.repository.find({
      where: { estadoId },
      select: { id: true, nome: true },
      order: { nome: 'ASC' },
    });
  }

  async existe(municipioId: number): Promise<boolean> {
    return this.repository.exists({
      where: { id: municipioId },
    });
  }
}
