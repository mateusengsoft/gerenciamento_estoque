import type { Request } from 'express';
import type { TipoUsuario } from '../usuarios/tipo-usuario.enum.js';

export interface PayloadJwt {
  sub: number;
  tipo: TipoUsuario;
}

export interface RequestComUsuario extends Request {
  usuario?: PayloadJwt;
}
