import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estado } from './estado.entity.js';
import { Municipio } from './municipio.entity.js';
import { Bairro } from './bairro.entity.js';
import { EstadosController } from './estados.controller.js';
import { MunicipiosController } from './municipios.controller.js';
import { GeografiaService } from './geografia.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Estado, Municipio, Bairro])],
  controllers: [EstadosController, MunicipiosController],
  providers: [GeografiaService],
})
export class GeografiaModule {}
