
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import {
  BairroMunicipioInvalidoError,
  RegistroDuplicadoError,
  RelacionamentoInexistenteError,
} from './fornecedores.errors.js';

import { cnpjValido } from '../common/validators/cnpj.js';
import { FornecedoresRepository } from './fornecedores.repository.js';
import { CriarFornecedorDto } from './dto/criar-fornecedor.dto.js';

import type { FornecedorPublico } from './fornecedor-publico.interface.js';
import type { Paginado } from '../common/interface/paginado.interface.js';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';

@Injectable()
export class FornecedoresService {
  constructor(
    private readonly fornecedoresRepository: FornecedoresRepository,
  ) {}

  async cadastrar(
  dto: CriarFornecedorDto,
  usuarioId: number,
): Promise<FornecedorPublico> {
  if (!cnpjValido(dto.cnpj)) {
    throw new BadRequestException('CNPJ inválido.');
  }

  if (
    (dto.endereco.bairroId && dto.endereco.bairroNome) ||
    (!dto.endereco.bairroId && !dto.endereco.bairroNome)
  ) {
    throw new BadRequestException(
      'Informe o bairro da lista ou digite o nome (apenas um dos dois).',
    );
  }

  const email = dto.email.toLowerCase();

  try {
    return await this.fornecedoresRepository.cadastrar(
      dto,
      usuarioId,
      email,
    );
  } catch (erro) {
    if (erro instanceof BairroMunicipioInvalidoError) {
      throw new BadRequestException(erro.message);
    }

    if (erro instanceof RegistroDuplicadoError) {
      throw new ConflictException(erro.message);
    }

    if (erro instanceof RelacionamentoInexistenteError) {
      throw new BadRequestException(erro.message);
    }

    throw erro;
  }
}

  async listar(
    paginacao: PaginacaoDto,
  ): Promise<Paginado<FornecedorPublico>> {
    const { pagina, limite } = paginacao;

    const [fornecedores, total] =
      await this.fornecedoresRepository.listar(pagina, limite);

    return {
      dados: fornecedores,
      total,
      pagina,
      limite,
    };
  }
}