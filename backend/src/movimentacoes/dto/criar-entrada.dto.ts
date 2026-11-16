import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CriarLoteDto } from '../../produtos/dto/criar-lote.dto.js';

export class CriarEntradaDto {
  @IsInt()
  @Min(1)
  produtoId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  loteId?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CriarLoteDto)
  novoLote?: CriarLoteDto;

  @IsInt()
  @Min(1)
  fornecedorId: number;

  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  codigoAquisicao: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorUnitario: number;

  @IsInt()
  @Min(1)
  localDestinoId: number;

  @IsISO8601({ strict: true })
  dataMovimentacao: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  observacao?: string;
}
