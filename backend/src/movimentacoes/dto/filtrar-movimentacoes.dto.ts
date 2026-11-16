import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsNumber, IsOptional, Matches, Min } from 'class-validator';
import { PaginacaoDto } from '../../common/dto/paginacao.dto.js';
import { TipoMovimentacao } from '../tipo-movimentacao.enum.js';
import { MotivoMovimentacao } from '../motivo-movimentacao.enum.js';

export class FiltrarMovimentacoesDto extends PaginacaoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  produtoId?: number;

  @IsOptional()
  @IsEnum(TipoMovimentacao)
  tipo?: TipoMovimentacao;

  @IsOptional()
  @IsEnum(MotivoMovimentacao)
  motivo?: MotivoMovimentacao;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuarioId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  quantidadeMinima?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  quantidadeMaxima?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataInicio deve estar no formato AAAA-MM-DD.' })
  @IsISO8601({ strict: true })
  dataInicio?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataFim deve estar no formato AAAA-MM-DD.' })
  @IsISO8601({ strict: true })
  dataFim?: string;
}