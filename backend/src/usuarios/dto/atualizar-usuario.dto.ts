import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AtualizarUsuarioDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  nome?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email?: string;
}
