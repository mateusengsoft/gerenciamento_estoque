import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, QueryFailedError, Repository } from 'typeorm';
import { Usuario } from './usuario.entity.js';
import { Endereco } from '../enderecos/endereco.entity.js';
import { Contato } from '../contatos/contato.entity.js';
import { UsuarioContato } from './usuario-contato.entity.js';
import { UsuarioEndereco } from './usuario-endereco.entity.js';
import { TipoUsuario } from './tipo-usuario.enum.js';
import { CriarContatoDto } from '../contatos/dto/criar-contato.dto.js';
import { CriarEnderecoDto } from '../enderecos/dto/criar-endereco.dto.js';
import type { UsuarioPublico } from './usuario-publico.interface.js';
import {
  BairroMunicipioInvalidoError,
  EmailDuplicadoError,
  MunicipioInexistenteError,
  RegistroDuplicadoError,
} from './usuarios.errors.js';

export interface NovoUsuario {
  login: string;
  senhaHash: string;
  nome: string;
  email: string;
  cpf: string;
  contato: CriarContatoDto;
  endereco: CriarEnderecoDto;
}

const CAMPOS_PUBLICOS = {
  id: true,
  login: true,
  nome: true,
  email: true,
  tipo: true,
  ativo: true,
} as const;

@Injectable()
export class UsuariosRepository {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,

    @InjectRepository(Endereco)
    private readonly enderecosRepository: Repository<Endereco>,

    @InjectRepository(Contato)
    private readonly contatosRepository: Repository<Contato>,

    @InjectRepository(UsuarioEndereco)
    private readonly usuariosEnderecosRepository: Repository<UsuarioEndereco>,

    @InjectRepository(UsuarioContato)
    private readonly usuariosContatosRepository: Repository<UsuarioContato>,
  ) {}

  async cadastrar(novo: NovoUsuario): Promise<UsuarioPublico> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        if (novo.endereco.bairroId) {
          const [bairro]: { municipio_id: number }[] = await manager.query(
            'select municipio_id from bairros where id = $1',
            [novo.endereco.bairroId],
          );
          if (!bairro || bairro.municipio_id !== novo.endereco.municipioId) {
            throw new BairroMunicipioInvalidoError();
          }
        }

        const usuario = await manager.save(Usuario, {
          login: novo.login,
          senhaHash: novo.senhaHash,
          nome: novo.nome,
          email: novo.email,
          cpf: novo.cpf,
          tipo: TipoUsuario.OPERADOR_ESTOQUE,
          ativo: false,
        });

        const endereco = await manager.save(Endereco, {
          ...novo.endereco,
          usuarioId: usuario.id,
        });

        const contato = await manager.save(Contato, {
          ...novo.contato,
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
      if (erro instanceof QueryFailedError) {
        const codigo = (erro.driverError as { code?: string }).code;
        if (codigo === '23505') {
          throw new RegistroDuplicadoError();
        }
        if (codigo === '23503') {
          throw new MunicipioInexistenteError();
        }
      }
      throw erro;
    }
  }

  async buscarPorLoginComSenha(login: string): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { login },
      select: { id: true, senhaHash: true, tipo: true, ativo: true },
    });
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { id },
      select: { id: true, tipo: true, ativo: true },
    });
  }

  async listar(pagina: number, limite: number): Promise<[Usuario[], number]> {
    return this.repository.findAndCount({
      where: { login: Not('sistema') },
      skip: (pagina - 1) * limite,
      take: limite,
      order: { nome: 'ASC' },
      select: CAMPOS_PUBLICOS,
    });
  }

  async buscarLogin(id: number): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { id },
      select: { id: true, login: true },
    });
  }

  async buscarComCpf(id: number): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { id },
      select: { ...CAMPOS_PUBLICOS, cpf: true },
    });
  }

  async buscarPublico(id: number): Promise<Usuario> {
    return this.repository.findOneOrFail({
      where: { id },
      select: CAMPOS_PUBLICOS,
    });
  }

  async listarEnderecos(usuarioId: number): Promise<Endereco[]> {
    const associacoes = await this.usuariosEnderecosRepository.find({
      where: { usuarioId },
      select: { usuarioId: true, enderecoId: true },
    });
    const ids = associacoes.map((a) => a.enderecoId);
    if (ids.length === 0) {
      return [];
    }
    return this.enderecosRepository.find({
      where: { id: In(ids) },
      select: {
        id: true,
        logradouro: true,
        numero: true,
        complemento: true,
        cep: true,
        municipioId: true,
        bairroId: true,
        bairroNome: true,
      },
    });
  }

  async listarContatos(usuarioId: number): Promise<Contato[]> {
    const associacoes = await this.usuariosContatosRepository.find({
      where: { usuarioId },
      select: { usuarioId: true, contatoId: true },
    });
    const ids = associacoes.map((a) => a.contatoId);
    if (ids.length === 0) {
      return [];
    }
    return this.contatosRepository.find({
      where: { id: In(ids) },
      select: { id: true, codigoPais: true, ddd: true, numero: true },
    });
  }

  async atualizar(
    id: number,
    campos: Partial<Pick<Usuario, 'nome' | 'email' | 'ativo' | 'tipo'>>,
  ): Promise<void> {
    try {
      await this.repository.update(id, campos);
    } catch (erro) {
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23505'
      ) {
        throw new EmailDuplicadoError();
      }
      throw erro;
    }
  }
}
