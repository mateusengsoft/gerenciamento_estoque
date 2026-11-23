import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import type { RequestComUsuario } from '../auth/payload-jwt.interface.js';
import { CriarProdutoDto } from './dto/criar-produto.dto.js';
import { ProdutosService } from './produtos.service.js';
import { FiltrarProdutosDto } from './dto/filtrar-produtos.dto.js';
import { AtualizarProdutoDto } from './dto/atualizar-produto.dto.js';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}
  @Post()
  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Perfis(TipoUsuario.ADMINISTRADOR)
  cadastrar(@Body() dto: CriarProdutoDto, @Req() request: RequestComUsuario) {
    if (!request.usuario) {
      throw new UnauthorizedException();
    }

    return this.produtosService.cadastrar(dto, request.usuario.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PerfisGuard)
  listar(@Query() filtros: FiltrarProdutosDto) {
    return this.produtosService.listar(filtros);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  @Perfis(TipoUsuario.ADMINISTRADOR)
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarProdutoDto,
  ) {
    return this.produtosService.atualizar(id, dto);
  }

  @Get(':id/lotes')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  listarLotes(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.listarLotes(id);
  }

  @Get(':id/locais')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  listarLocais(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.listarLocais(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PerfisGuard)
  detalhar(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.detalhar(id);
  }
}
