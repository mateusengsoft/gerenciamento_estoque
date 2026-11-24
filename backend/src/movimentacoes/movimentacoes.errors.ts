// Classe-mãe: toda regra de negócio violada que deve virar um 400.
export class RegraMovimentacaoError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'RegraMovimentacaoError';
  }
}

export class ProdutoInexistenteError extends RegraMovimentacaoError {
  constructor() {
    super('Produto informado não existe.');
  }
}

export class ProdutoInativoError extends RegraMovimentacaoError {
  constructor() {
    super('Produto inativo não pode receber movimentações.');
  }
}

export class FornecedorInvalidoError extends RegraMovimentacaoError {
  constructor() {
    super('Fornecedor inexistente ou inativo.');
  }
}

export class LocalNaoAutorizadoError extends RegraMovimentacaoError {
  constructor() {
    super('Este local não está autorizado para o produto.');
  }
}

export class LoteDeOutroProdutoError extends RegraMovimentacaoError {
  constructor() {
    super('O lote informado não pertence ao produto.');
  }
}

export class VencimentoObrigatorioError extends RegraMovimentacaoError {
  constructor() {
    super('Produtos perecíveis precisam da data de vencimento do lote.');
  }
}

// 409
export class LoteDuplicadoError extends Error {
  constructor() {
    super('Já existe um lote com este código para o produto.');
    this.name = 'LoteDuplicadoError';
  }
}

// 409
export class AquisicaoDuplicadaError extends Error {
  constructor() {
    super('Esta aquisição já foi registrada para este fornecedor e lote.');
    this.name = 'AquisicaoDuplicadaError';
  }
}

// 422
export class SaldoInsuficienteError extends Error {
  constructor(disponivel: string) {
    super(`Saldo insuficiente. Disponível: ${disponivel}.`);
    this.name = 'SaldoInsuficienteError';
  }
}

// 500: o saldo e o histórico de entradas não batem.
export class SaldoInconsistenteError extends Error {
  constructor() {
    super('O saldo do lote não confere com o histórico de entradas.');
    this.name = 'SaldoInconsistenteError';
  }
}
