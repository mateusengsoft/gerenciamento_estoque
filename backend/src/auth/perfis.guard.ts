import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TipoUsuario } from '../usuarios/tipo-usuario.enum.js';
import { PERFIS_KEY } from './perfis.decorator.js';
import { type RequestComUsuario } from './payload-jwt.interface.js';

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisPermitidos = this.reflector.getAllAndOverride<TipoUsuario[]>(
      PERFIS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!perfisPermitidos) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestComUsuario>();
    const tipo = request.usuario?.tipo;

    if (!tipo || !perfisPermitidos.includes(tipo)) {
      throw new ForbiddenException('Acesso negado para este perfil.');
    }

    return true;
  }
}
