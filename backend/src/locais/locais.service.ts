import { Injectable } from '@nestjs/common';
import { Local } from './local.entity.js';
import { LocaisRepository } from './locais.repository.js';

@Injectable()
export class LocaisService {
  constructor(private readonly locaisRepository: LocaisRepository) {}

  async listar(): Promise<Local[]> {
    return await this.locaisRepository.listar();
  }
}
