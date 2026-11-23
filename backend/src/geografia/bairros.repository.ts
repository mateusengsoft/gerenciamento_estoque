import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bairro } from './bairro.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class BairrosRepository {
  constructor(
    @InjectRepository(Bairro)
    private readonly repository: Repository<Bairro>,
  ) {}

  async listarPorMunicipio(municipioId: number): Promise<Bairro[]> {
    return this.repository.find({
      where: { municipioId },
      select: { id: true, nome: true },
      order: { nome: 'ASC' },
    });
  }
}
