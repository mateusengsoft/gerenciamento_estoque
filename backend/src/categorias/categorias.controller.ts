import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriaService: CategoriasService) {}

  @Get()
  listar(@Query() paginacao: PaginacaoDto) {
    return this.categoriaService.listar(paginacao);
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaService.buscarPorId(id);
  }
}
