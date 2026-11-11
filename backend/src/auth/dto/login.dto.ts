import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @MaxLength(20)
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(72)
  senha: string;
}
