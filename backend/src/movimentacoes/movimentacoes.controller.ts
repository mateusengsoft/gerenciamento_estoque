import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PerfisGuard } from '../auth/perfis.guard.js';
import type { RequestComUsuario } from '../auth/payload-jwt.interface.js';
import { CriarEntradaDto } from './dto/criar-entrada.dto.js';
import { MovimentacoesService } from './movimentacoes.service.js';
import { CriarSaidaDto } from './dto/criar-saida.dto.js';

@Controller('movimentacoes')
export class MovimentacoesController {
  constructor(private readonly movimentacoesService: MovimentacoesService) {}

  @Post('entradas')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  registrarEntrada(
    @Body() dto: CriarEntradaDto,
    @Req() request: RequestComUsuario,
  ) {
    if (!request.usuario) {
      throw new UnauthorizedException();
    }

    return this.movimentacoesService.registrarEntrada(dto, request.usuario.sub);
  }

  @Post('saidas')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  async registrarSaida(
    @Body() dto: CriarSaidaDto,
    @Req() request: RequestComUsuario,
  ) {
    if (!request.usuario) {
      throw new UnauthorizedException();
    }
    return await this.movimentacoesService.registrarSaida(
      dto,
      request.usuario.sub,
    );
  }
}
