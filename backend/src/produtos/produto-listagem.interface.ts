export interface ProdutoListagem {
  id: number;
  codigo: string;
  nome: string;
  categoriaNome: string;
  precoVendaAtual: string;
  ativo: boolean;
  perecivel: boolean;
  quantidadeTotal: string;
  estoqueMinimo: string;
  estoqueBaixo: boolean;
  proximoDoVencimento: boolean;
}
