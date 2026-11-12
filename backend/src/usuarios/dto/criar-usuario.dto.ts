import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CriarContatoDto } from '../../contatos/dto/criar-contato.dto.js';
import { CriarEnderecoDto } from '../../enderecos/dto/criar-endereco.dto.js';

export class CriarUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  login: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @IsNotEmpty()
  senha: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @IsString()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @Matches(/^[0-9]{11}$/)
  cpf: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => CriarContatoDto)
  contato: CriarContatoDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => CriarEnderecoDto)
  endereco: CriarEnderecoDto;
}
