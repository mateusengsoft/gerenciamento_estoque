import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Local } from './local.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { LocaisController } from './locais.controller.js';
import { LocaisService } from './locais.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Local]), AuthModule],
  controllers: [LocaisController],
  providers: [LocaisService],
})
export class LocaisModule {}
