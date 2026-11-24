import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { AtualizarAtivacaoDto } from './dto/atualizar-ativacao.dto.js';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto.js';
import { CriarContatoDto } from '../contatos/dto/criar-contato.dto.js';
import { CriarEnderecoDto } from '../enderecos/dto/criar-endereco.dto.js';

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

  @Patch(':id/ativacao')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Perfis(TipoUsuario.ADMINISTRADOR)
  atualizarAtivacao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarAtivacaoDto,
  ) {
    return this.usuariosService.atualizarAtivacao(id, dto);
  }

  @Patch(':id/contato')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Perfis(TipoUsuario.ADMINISTRADOR)
  atualizarContato(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CriarContatoDto,
  ) {
    return this.usuariosService.atualizarContato(id, dto);
  }

  @Patch(':id/endereco')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Perfis(TipoUsuario.ADMINISTRADOR)
  atualizarEndereco(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CriarEnderecoDto,
  ) {
    return this.usuariosService.atualizarEndereco(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Perfis(TipoUsuario.ADMINISTRADOR)
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarUsuarioDto,
  ) {
    return this.usuariosService.atualizar(id, dto);
  }
}
