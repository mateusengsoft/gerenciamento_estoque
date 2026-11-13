import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CriarEnderecoDto } from '../../enderecos/dto/criar-endereco.dto.js';
import { Transform, Type } from 'class-transformer';
import { CriarContatoDto } from '../../contatos/dto/criar-contato.dto.js';

export class CriarFornecedorDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  nome: string;

  @Matches(/^[0-9]{14}$/)
  cnpj: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => CriarEnderecoDto)
  endereco: CriarEnderecoDto;

  @IsArray()
  @ArrayMinSize(1)
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => CriarContatoDto)
  contatos: CriarContatoDto[];
}
