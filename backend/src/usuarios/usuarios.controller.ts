import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { UsuariosService } from './usuarios.service.js';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PerfisGuard } from '../auth/perfis.guard.js';
import { Perfis } from '../auth/perfis.decorator.js';
import { TipoUsuario } from './tipo-usuario.enum.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  autoCadastrar(@Body() dto: CriarUsuarioDto) {
    return this.usuariosService.autoCadastrar(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Perfis(TipoUsuario.ADMINISTRADOR)
  listar(@Query() paginacao: PaginacaoDto) {
    return this.usuariosService.listar(paginacao);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Perfis(TipoUsuario.ADMINISTRADOR)
  detalhar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.detalhar(id);
  }
}
