import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Usuario } from './usuario.entity.js';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { AtualizarAtivacaoDto } from './dto/atualizar-ativacao.dto.js';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto.js';
import { cpfValido } from '../common/validators/cpf.js';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';
import type { Paginado } from '../common/interface/paginado.interface.js';
import type { UsuarioPublico } from './usuario-publico.interface.js';
import { UsuariosRepository } from './usuarios.repository.js';
import {
  BairroMunicipioInvalidoError,
  EmailDuplicadoError,
  MunicipioInexistenteError,
  RegistroDuplicadoError,
} from './usuarios.errors.js';
import { CriarEnderecoDto } from '../enderecos/dto/criar-endereco.dto.js';
import { CriarContatoDto } from '../contatos/dto/criar-contato.dto.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly usuariosRepository: UsuariosRepository) {}

  async autoCadastrar(dto: CriarUsuarioDto): Promise<UsuarioPublico> {
    if (!cpfValido(dto.cpf)) {
      throw new BadRequestException('CPF inválido.');
    }

    this.validarBairro(dto.endereco);

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    try {
      return await this.usuariosRepository.cadastrar({
        login: dto.login.toLowerCase(),
        senhaHash,
        nome: dto.nome,
        email: dto.email.toLowerCase(),
        cpf: dto.cpf,
        contato: dto.contato,
        endereco: dto.endereco,
      });
    } catch (erro) {
      if (erro instanceof RegistroDuplicadoError) {
        throw new ConflictException(erro.message);
      }
      if (
        erro instanceof BairroMunicipioInvalidoError ||
        erro instanceof MunicipioInexistenteError
      ) {
        throw new BadRequestException(erro.message);
      }
      throw erro;
    }
  }

  async buscarPorLoginComSenha(login: string): Promise<Usuario | null> {
    return this.usuariosRepository.buscarPorLoginComSenha(login.toLowerCase());
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    return this.usuariosRepository.buscarPorId(id);
  }

  async listar(paginacao: PaginacaoDto): Promise<Paginado<UsuarioPublico>> {
    const { pagina, limite } = paginacao;
    const [usuarios, total] = await this.usuariosRepository.listar(
      pagina,
      limite,
    );
    return { dados: usuarios, total, pagina, limite };
  }

  async detalhar(id: number) {
    const usuario = await this.usuariosRepository.buscarComCpf(id);
    if (!usuario || usuario.login === 'sistema') {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const [enderecos, contatos] = await Promise.all([
      this.usuariosRepository.listarEnderecos(id),
      this.usuariosRepository.listarContatos(id),
    ]);

    return { ...usuario, enderecos, contatos };
  }

  async atualizarAtivacao(
    id: number,
    dto: AtualizarAtivacaoDto,
  ): Promise<UsuarioPublico> {
    await this.garantirQueExiste(id);

    await this.usuariosRepository.atualizar(id, {
      ativo: dto.ativo,
      tipo: dto.tipo,
    });

    return this.usuariosRepository.buscarPublico(id);
  }

  async atualizar(
    id: number,
    dto: AtualizarUsuarioDto,
  ): Promise<UsuarioPublico> {
    if (dto.nome === undefined && dto.email === undefined) {
      throw new BadRequestException(
        'Informe ao menos um campo para atualizar.',
      );
    }

    await this.garantirQueExiste(id);

    try {
      await this.usuariosRepository.atualizar(id, {
        nome: dto.nome,
        email: dto.email?.toLowerCase(),
      });
    } catch (erro) {
      if (erro instanceof EmailDuplicadoError) {
        throw new ConflictException(erro.message);
      }
      throw erro;
    }

    return this.usuariosRepository.buscarPublico(id);
  }

  private async garantirQueExiste(id: number): Promise<void> {
    const existente = await this.usuariosRepository.buscarLogin(id);
    if (!existente || existente.login === 'sistema') {
      throw new NotFoundException('Usuário não encontrado.');
    }
  }
  async atualizarContato(id: number, dto: CriarContatoDto) {
    await this.garantirQueExiste(id);

    const atualizou = await this.usuariosRepository.atualizarContato(id, dto);
    if (!atualizou) {
      throw new NotFoundException('Este usuário não tem contato cadastrado.');
    }
    return this.usuariosRepository.listarContatos(id);
  }

  async atualizarEndereco(id: number, dto: CriarEnderecoDto) {
    this.validarBairro(dto);
    await this.garantirQueExiste(id);

    try {
      const atualizou = await this.usuariosRepository.atualizarEndereco(
        id,
        dto,
      );
      if (!atualizou) {
        throw new NotFoundException(
          'Este usuário não tem endereço cadastrado.',
        );
      }
    } catch (erro) {
      if (
        erro instanceof BairroMunicipioInvalidoError ||
        erro instanceof MunicipioInexistenteError
      ) {
        throw new BadRequestException(erro.message);
      }
      throw erro;
    }
    return this.usuariosRepository.listarEnderecos(id);
  }

  private validarBairro(endereco: CriarEnderecoDto): void {
    if (
      (endereco.bairroId && endereco.bairroNome) ||
      (!endereco.bairroId && !endereco.bairroNome)
    ) {
      throw new BadRequestException(
        'Informe o bairro da lista ou digite o nome (apenas um dos dois).',
      );
    }
  }
}
