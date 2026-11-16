export interface EstoqueResumo {
  produtoId: number;
  codigo: string;
  nome: string;
  ativo: boolean;
  quantidadeTotal: string;
  estoqueMinimo: string;
  abaixoDoMinimo: boolean;
}

export interface PosicaoEstoque {
  loteId: number;
  codigoLote: string;
  dataVencimento: string | null;
  localId: number;
  corredor: string;
  prateleira: string;
  secao: string;
  quantidade: string;
}

export interface EstoqueDetalhe {
  produtoId: number;
  codigo: string;
  nome: string;
  ativo: boolean;
  quantidadeTotal: string;
  estoqueMinimo: string;
  posicoes: PosicaoEstoque[];
}
