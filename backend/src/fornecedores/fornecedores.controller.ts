import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PerfisGuard } from '../auth/perfis.guard.js';
import { TipoUsuario } from '../usuarios/tipo-usuario.enum.js';
import { Perfis } from '../auth/perfis.decorator.js';
import { CriarFornecedorDto } from './dto/criar-fornecedor.dto.js';
import type { RequestComUsuario } from '../auth/payload-jwt.interface.js';
import { FornecedoresService } from './fornecedores.service.js';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';

@Controller('fornecedores')
export class FornecedoresController {
  constructor(private readonly fornecedoresService: FornecedoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Perfis(TipoUsuario.ADMINISTRADOR)
  cadastrar(
    @Body() dto: CriarFornecedorDto,
    @Req() request: RequestComUsuario,
  ) {
    if (!request.usuario) {
      throw new UnauthorizedException();
    }

    return this.fornecedoresService.cadastrar(dto, request.usuario.sub);
  }

  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Get()
  listar(@Query() paginacao: PaginacaoDto) {
    return this.fornecedoresService.listar(paginacao);
  }
}
