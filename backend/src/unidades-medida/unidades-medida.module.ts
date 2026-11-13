import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadeMedida } from './unidade-medida.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { UnidadesMedidaController } from './unidades-medida.controller.js';
import { UnidadesMedidaService } from './unidades-medida.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadeMedida]), AuthModule],
  controllers: [UnidadesMedidaController],
  providers: [UnidadesMedidaService],
})
export class UnidadesMedidaModule {}
