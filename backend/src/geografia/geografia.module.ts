import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estado } from './estado.entity.js';
import { Municipio } from './municipio.entity.js';
import { Bairro } from './bairro.entity.js';
import { EstadosController } from './estados.controller.js';
import { MunicipiosController } from './municipios.controller.js';
import { GeografiaService } from './geografia.service.js';
import { EstadosRepository } from './estados.repository.js';
import { MunicipiosRepository } from './municipios.repository.js';
import { BairrosRepository } from './bairros.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([Estado, Municipio, Bairro])],
  controllers: [EstadosController, MunicipiosController],
  providers: [
    GeografiaService,
    EstadosRepository,
    MunicipiosRepository,
    BairrosRepository,
  ],
})
export class GeografiaModule {}
