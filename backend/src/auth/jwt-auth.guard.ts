import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { PayloadJwt, RequestComUsuario } from './payload-jwt.interface.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestComUsuario>();

    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token não informado.');
    }

    try {
      request.usuario = await this.jwtService.verifyAsync<PayloadJwt>(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    return true;
  }
}
