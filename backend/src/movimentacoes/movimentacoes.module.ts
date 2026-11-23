import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { Aquisicao } from './aquisicao.entity.js';
import { MovimentacaoEstoque } from './movimentacao-estoque.entity.js';
import { MovimentacaoAquisicao } from './movimentacao-aquisicao.entity.js';
import { EstoqueAtual } from './estoque-atual.entity.js';
import { Produto } from '../produtos/produto.entity.js';
import { Lote } from '../produtos/lote.entity.js';
import { LocalProduto } from '../produtos/local-produto.entity.js';
import { Fornecedor } from '../fornecedores/fornecedor.entity.js';
import { MovimentacoesController } from './movimentacoes.controller.js';
import { MovimentacoesService } from './movimentacoes.service.js';
import { EstoqueService } from './estoque.service.js';
import { EstoqueController } from './estoque.controller.js';
import { EstoqueRepository } from './estoque.repository.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Aquisicao,
      MovimentacaoEstoque,
      MovimentacaoAquisicao,
      EstoqueAtual,
      Produto,
      Lote,
      LocalProduto,
      Fornecedor,
    ]),
    AuthModule,
  ],
  controllers: [MovimentacoesController, EstoqueController],
  providers: [MovimentacoesService, EstoqueService, EstoqueRepository],
})
export class MovimentacoesModule {}
