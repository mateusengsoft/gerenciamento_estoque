import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CriarLoteDto } from './criar-lote.dto.js';

export class CriarProdutoDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(50)
  codigo: string;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(50)
  nome: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  descricao?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precoVendaAtual: number;

  @IsInt()
  @Min(1)
  categoriaId: number;

  @IsInt()
  @Min(1)
  unidadeEstoqueId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  unidadeConteudoId?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidadeConteudo?: number;

  @IsBoolean()
  perecivel: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  estoqueMinimo?: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => CriarLoteDto)
  primeiroLote: CriarLoteDto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  locaisIds: number[];
}
