import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity.js';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { cpfValido } from '../common/validators/cpf.js';
import bcrypt from 'bcrypt';
import { TipoUsuario } from './tipo-usuario.enum.js';
import { Endereco } from '../enderecos/endereco.entity.js';
import { Contato } from '../contatos/contato.entity.js';
import { UsuarioContato } from './usuario-contato.entity.js';
import { UsuarioEndereco } from './usuario-endereco.entity.js';
import type { UsuarioPublico } from './usuario-publico.interface.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  async autoCadastrar(dto: CriarUsuarioDto): Promise<UsuarioPublico> {
    if (!cpfValido(dto.cpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    if (
      (dto.endereco.bairroId && dto.endereco.bairroNome) ||
      (!dto.endereco.bairroId && !dto.endereco.bairroNome)
    ) {
      throw new BadRequestException(
        'Informe o bairro da lista ou digite o nome (apenas um dos dois).',
      );
    }

    const loginMinusculas = dto.login.toLowerCase();
    const emailMinusculas = dto.email.toLowerCase();
    const senhaHash = await bcrypt.hash(dto.senha, 10);
    try {
      return await this.dataSource.transaction(async (manager) => {
        if (dto.endereco.bairroId) {
          const [bairro]: { municipio_id: number }[] = await manager.query(
            'select municipio_id from bairros where id = $1',
            [dto.endereco.bairroId],
          );

          if (!bairro || bairro.municipio_id !== dto.endereco.municipioId) {
            throw new BadRequestException(
              'O bairro não pertence ao município informado.',
            );
          }
        }

        const usuario = await manager.save(Usuario, {
          login: loginMinusculas,
          senhaHash: senhaHash,
          nome: dto.nome,
          email: emailMinusculas,
          cpf: dto.cpf,
          tipo: TipoUsuario.OPERADOR_ESTOQUE,
          ativo: false,
        });

        const endereco = await manager.save(Endereco, {
          ...dto.endereco,
          usuarioId: usuario.id,
        });

        const contato = await manager.save(Contato, {
          ...dto.contato,
          usuarioId: usuario.id,
        });

        await manager.save(UsuarioContato, {
          usuarioId: usuario.id,
          contatoId: contato.id,
        });

        await manager.save(UsuarioEndereco, {
          usuarioId: usuario.id,
          enderecoId: endereco.id,
        });

        return {
          id: usuario.id,
          login: usuario.login,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
          ativo: usuario.ativo,
        };
      });
    } catch (erro) {
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Login, e-mail ou CPF já cadastrado.');
      } 
      if (erro instanceof QueryFailedError && (erro.driverError as {code?: string}).code ==='23503'
    ){ throw new BadRequestException('Município informado não existe.')}

      throw erro;
    }
  }

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
