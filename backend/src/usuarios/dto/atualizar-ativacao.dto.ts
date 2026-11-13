import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { TipoUsuario } from '../tipo-usuario.enum.js';

export class AtualizarAtivacaoDto {
  @IsBoolean()
  ativo: boolean;

  @IsOptional()
  @IsEnum(TipoUsuario)
  tipo?: TipoUsuario;
}
