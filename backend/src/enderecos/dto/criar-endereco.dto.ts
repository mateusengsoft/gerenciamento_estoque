import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CriarEnderecoDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  logradouro: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(10)
  numero?: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(255)
  complemento?: string;

  @IsString()
  @Matches(/^[0-9]{5}-?[0-9]{3}$/)
  cep: string;

  @IsInt()
  @Min(1)
  municipioId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  bairroId?: number;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(255)
  bairroNome?: string;
}
