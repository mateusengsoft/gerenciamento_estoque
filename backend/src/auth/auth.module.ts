import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [
    UsuariosModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const lerVariavel = (name: string) =>
          configService.getOrThrow<string>(name);
        const secret = lerVariavel('JWT_SECRET');
        const expiresIn = lerVariavel(
          'JWT_EXPIRES_IN',
        ) as JwtSignOptions['expiresIn'];
        const signOptions = { expiresIn };
        return { secret, signOptions };
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule, UsuariosModule],
})
export class AuthModule {}
