import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async buscarPorLoginComSenha(login: string): Promise<Usuario | null> {
    const loginNormalizado = login.toLowerCase();
    const usuario = await this.usuariosRepository.findOne({
      where: { login: loginNormalizado },
      select: { id: true, senhaHash: true, tipo: true, ativo: true },
    });

    return usuario;
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      select: { id: true, tipo: true, ativo: true },
    });

    return usuario;
  }
}
