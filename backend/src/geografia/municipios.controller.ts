import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GeografiaService } from './geografia.service.js';

@Controller('municipios')
export class MunicipiosController {
  constructor(private readonly geografiaService: GeografiaService) {}

  @Get(':id/bairros')
  listarBairrosPorMunicipio(@Param('id', ParseIntPipe) id: number) {
    return this.geografiaService.listarBairrosPorMunicipio(id);
  }
}
