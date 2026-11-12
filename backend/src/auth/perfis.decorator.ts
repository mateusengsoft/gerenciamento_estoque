import { SetMetadata } from '@nestjs/common';
import { TipoUsuario } from '../usuarios/tipo-usuario.enum.js';

export const PERFIS_KEY = 'perfis';

export const Perfis = (...perfis: TipoUsuario[]) =>
  SetMetadata(PERFIS_KEY, perfis);
