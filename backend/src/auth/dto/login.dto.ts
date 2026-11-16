import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(72)
  senha: string;
}
