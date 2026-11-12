import { Body, Controller, Post } from '@nestjs/common';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  autoCadastrar(@Body() dto: CriarUsuarioDto) {
    return this.usuariosService.autoCadastrar(dto);
  }
}
