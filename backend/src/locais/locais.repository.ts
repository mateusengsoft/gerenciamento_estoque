import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Local } from './local.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasRepository {
  constructor(
    @InjectRepository(Local)
    private readonly repository: Repository<Local>,
  ) {}

  async listar(): Promise<Local[]> {
    return this.repository.find({
      order: { corredor: 'ASC', prateleira: 'ASC', secao: 'ASC' },
      select: { id: true, corredor: true, prateleira: true, secao: true },
    });
  }
}
