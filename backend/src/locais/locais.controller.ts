import { Controller, Get, UseGuards } from '@nestjs/common';
import { LocaisService } from './locais.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PerfisGuard } from '../auth/perfis.guard.js';

@UseGuards(JwtAuthGuard, PerfisGuard)
@Controller('locais')
export class LocaisController {
  constructor(private readonly locaisService: LocaisService) {}

  @Get()
  listar() {
    return this.locaisService.listar();
  }
}
