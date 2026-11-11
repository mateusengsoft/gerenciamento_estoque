import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { buildDatabaseOptions } from './database/database.config.js';
import { CategoriasModule } from './categorias/categorias.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const lerVariavel = (name: string) =>
          configService.getOrThrow<string>(name);
        const opcoes = buildDatabaseOptions(lerVariavel);
        return { ...opcoes, autoLoadEntities: true };
      },
    }),
    CategoriasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
