import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FornecedorContato } from './fornecedor-contato.entity.js';
import { Endereco } from '../enderecos/endereco.entity.js';
import { Contato } from '../contatos/contato.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { FornecedoresService } from './fornecedores.service.js';
import { FornecedoresController } from './fornecedores.controller.js';
import { Fornecedor } from './fornecedor.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fornecedor,
      FornecedorContato,
      Endereco,
      Contato,
    ]),
    AuthModule,
  ],
  controllers: [FornecedoresController],
  providers: [FornecedoresService],
})
export class FornecedoresModule {}
