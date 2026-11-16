import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PerfisGuard } from '../auth/perfis.guard.js';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';
import { EstoqueService } from './estoque.service.js';

@Controller('estoque')
@UseGuards(JwtAuthGuard, PerfisGuard)
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Get()
  listar(@Query() paginacao: PaginacaoDto) {
    return this.estoqueService.listar(paginacao);
  }

  @Get(':produtoId')
  detalhar(@Param('produtoId', ParseIntPipe) produtoId: number) {
    return this.estoqueService.detalhar(produtoId);
  }
}
