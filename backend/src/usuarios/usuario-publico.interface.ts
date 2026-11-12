import type { TipoUsuario } from './tipo-usuario.enum.js';

export interface UsuarioPublico {
  id: number;
  login: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  ativo: boolean;
}
