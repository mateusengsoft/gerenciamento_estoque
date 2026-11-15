import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './produto.entity.js';
import { Lote } from './lote.entity.js';
import { EstoqueProduto } from './estoque-produto.entity.js';
import { LocalProduto } from './local-produto.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { ProdutosController } from './produtos.controller.js';
import { ProdutosService } from './produtos.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produto, Lote, EstoqueProduto, LocalProduto]),
    AuthModule,
  ],
  controllers: [ProdutosController],
  providers: [ProdutosService],
})
export class ProdutosModule {}
