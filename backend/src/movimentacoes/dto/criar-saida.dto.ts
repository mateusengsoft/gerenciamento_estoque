import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { MotivoMovimentacao } from '../motivo-movimentacao.enum.js';

export class CriarSaidaDto {
  @IsInt()
  @Min(1)
  loteId: number;

  @IsInt()
  @Min(1)
  localOrigemId: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade: number;

  @IsIn([
    MotivoMovimentacao.VENDA,
    MotivoMovimentacao.PERDA,
    MotivoMovimentacao.VENCIMENTO,
  ])
  motivo: MotivoMovimentacao;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorUnitario?: number;

  @IsISO8601({ strict: true })
  dataMovimentacao: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @MaxLength(255)
  observacao?: string;
}
