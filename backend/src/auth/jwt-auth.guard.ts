import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { PayloadJwt, RequestComUsuario } from './payload-jwt.interface.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestComUsuario>();

    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token não informado.');
    }

    let payload: PayloadJwt;

    try {
      payload = await this.jwtService.verifyAsync<PayloadJwt>(token);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    const usuario = await this.usuariosService.buscarPorId(payload.sub);

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário inativo ou inexistente.');
    }

    request.usuario = { sub: usuario.id, tipo: usuario.tipo };

    return true;
  }
}
