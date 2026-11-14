import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Fornecedor } from './fornecedor.entity.js';
import { CriarFornecedorDto } from './dto/criar-fornecedor.dto.js';
import { cnpjValido } from '../common/validators/cnpj.js';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Endereco } from '../enderecos/endereco.entity.js';
import { FornecedorContato } from './fornecedor-contato.entity.js';
import { Contato } from '../contatos/contato.entity.js';
import type { Paginado } from '../common/interface/paginado.interface.js';
import { PaginacaoDto } from '../common/dto/paginacao.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import type { FornecedorPublico } from './fornecedor-publico.interface.js';
@Injectable()
export class FornecedoresService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Fornecedor)
    private readonly fornecedoresRepository: Repository<Fornecedor>,
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

        const endereco = await manager.save(Endereco, {
          ...dto.endereco,
          usuarioId,
        });

        const fornecedor = await manager.save(Fornecedor, {
          nome: dto.nome,
          cnpj: dto.cnpj,
          email: email,
          enderecoId: endereco.id,
          usuarioId,
        });

        for (const contatoDto of dto.contatos) {
          const contato = await manager.save(Contato, {
            ...contatoDto,
            usuarioId,
          });

          await manager.save(FornecedorContato, {
            fornecedorId: fornecedor.id,
            contatoId: contato.id,
          });
        }
        return {
          id: fornecedor.id,
          nome: fornecedor.nome,
          email: fornecedor.email,
          cnpj: fornecedor.cnpj,
          ativo: fornecedor.ativo,
        };
      });
    } catch (erro) {
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('CNPJ ou e-mail já cadastrado.');
      }
      if (
        erro instanceof QueryFailedError &&
        (erro.driverError as { code?: string }).code === '23503'
      ) {
        throw new BadRequestException('Município informado não existe.');
      }

      throw erro;
    }
  }

  async listar(paginacao: PaginacaoDto): Promise<Paginado<FornecedorPublico>> {
    const { pagina, limite } = paginacao;
    const [fornecedores, total] =
      await this.fornecedoresRepository.findAndCount({
        skip: (pagina - 1) * limite,
        take: limite,
        order: { nome: 'ASC' },
        select: { id: true, nome: true, cnpj: true, email: true, ativo: true },
      });
    return {
      dados: fornecedores,
      total,
      pagina,
      limite,
    };
  }
}
