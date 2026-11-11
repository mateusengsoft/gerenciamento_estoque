import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const loginUsuario = await this.usuariosService.buscarPorLoginComSenha(
      dto.login,
    );

    if (!loginUsuario) {
      throw new UnauthorizedException('Login ou senha inválidos.');
    }

    const senhaConfere = await bcrypt.compare(
      dto.senha,
      loginUsuario.senhaHash,
    );

    if (!senhaConfere) {
      throw new UnauthorizedException('Login ou senha inválidos.');
    }

    if (!loginUsuario.ativo) {
      throw new ForbiddenException(
        'Usuário inativo. Aguarde a aprovação do administrador.',
      );
    }
    const payload = {
      sub: loginUsuario.id,
      tipo: loginUsuario.tipo,
    };
    const token = await this.jwtService.signAsync(payload);
    return { accessToken: token };
  }
}
