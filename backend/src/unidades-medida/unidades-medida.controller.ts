import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PerfisGuard } from '../auth/perfis.guard.js';
import { UnidadesMedidaService } from './unidades-medida.service.js';

@UseGuards(JwtAuthGuard, PerfisGuard)
@Controller('unidades-medida')
export class UnidadesMedidaController {
  constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}

  @Get()
  listar() {
    return this.unidadesMedidaService.listar();
  }
}
