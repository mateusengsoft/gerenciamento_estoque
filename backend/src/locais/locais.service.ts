import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Local } from './local.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class LocaisService {
  constructor(
    @InjectRepository(Local)
    private readonly locaisRepository: Repository<Local>,
  ) {}

  async listar(): Promise<Local[]> {
    const locais = await this.locaisRepository.find({
      order: { corredor: 'ASC', prateleira: 'ASC', secao: 'ASC' },
      select: { id: true, corredor: true, prateleira: true, secao: true },
    });
    return locais;
  }
}
