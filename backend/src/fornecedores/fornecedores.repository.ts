import { Injectable } from '@nestjs/common';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Fornecedor } from './fornecedor.entity.js';
import { Endereco } from '../enderecos/endereco.entity.js';
import { Contato } from '../contatos/contato.entity.js';
import { FornecedorContato } from './fornecedor-contato.entity.js';

import { CriarFornecedorDto } from './dto/criar-fornecedor.dto.js';
import type { FornecedorPublico } from './fornecedor-publico.interface.js';

import {
  BairroMunicipioInvalidoError,
  RegistroDuplicadoError,
  RelacionamentoInexistenteError,
} from './fornecedores.errors.js';

@Injectable()
export class FornecedoresRepository {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Fornecedor)
    private readonly repository: Repository<Fornecedor>,
  ) {}

  async cadastrar(
    dto: CriarFornecedorDto,
    usuarioId: number,
    email: string,
  ): Promise<FornecedorPublico> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        if (dto.endereco.bairroId) {
          const [bairro]: { municipio_id: number }[] = await manager.query(
            'select municipio_id from bairros where id = $1',
            [dto.endereco.bairroId],
          );

          if (!bairro || bairro.municipio_id !== dto.endereco.municipioId) {
            throw new BairroMunicipioInvalidoError();
          }
        }

        const endereco = await manager.save(Endereco, {
          ...dto.endereco,
          usuarioId,
        });

        const fornecedor = await manager.save(Fornecedor, {
          nome: dto.nome,
          cnpj: dto.cnpj,
          email,
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
      this.traduzirErroBanco(erro);
    }
  }

  async listar(
    pagina: number,
    limite: number,
  ): Promise<[Fornecedor[], number]> {
    return this.repository.findAndCount({
      skip: (pagina - 1) * limite,
      take: limite,
      order: { nome: 'ASC' },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        email: true,
        ativo: true,
      },
    });
  }

  private traduzirErroBanco(erro: unknown): never {
    if (erro instanceof QueryFailedError) {
      const codigo = (erro.driverError as { code?: string }).code;

      if (codigo === '23505') {
        throw new RegistroDuplicadoError();
      }

      if (codigo === '23503') {
        throw new RelacionamentoInexistenteError();
      }
    }

    throw erro;
  }
}
