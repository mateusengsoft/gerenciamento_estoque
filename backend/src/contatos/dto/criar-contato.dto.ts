import { IsOptional, IsString, Matches } from 'class-validator';

export class CriarContatoDto {
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{1,3}$/)
  codigoPais?: string;

  @IsString()
  @Matches(/^[0-9]{2}$/)
  ddd: string;

  @IsString()
  @Matches(/^[0-9]{8,9}$/)
  numero: string;
}
