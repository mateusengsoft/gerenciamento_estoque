import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity.js';
import { UsuariosService } from './usuarios.service.js';
import { Endereco } from '../enderecos/endereco.entity.js';
import { Contato } from '../contatos/contato.entity.js';
import { UsuarioEndereco } from './usuario-endereco.entity.js';
import { UsuarioContato } from './usuario-contato.entity.js';
import { UsuariosController } from './usuarios.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Endereco,
      Contato,
      UsuarioEndereco,
      UsuarioContato,
    ]),
  ],
  providers: [UsuariosService],
  exports: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
