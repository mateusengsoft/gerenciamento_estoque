import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GeografiaService } from './geografia.service.js';

@Controller('estados')
export class EstadosController {
  constructor(private readonly geografiaService: GeografiaService) {}

  @Get()
  listarEstados() {
    return this.geografiaService.listarEstados();
  }

  @Get(':id/municipios')
  listarMunicipiosPorEstado(@Param('id', ParseIntPipe) id: number) {
    return this.geografiaService.listarMunicipiosPorEstado(id);
  }
}
