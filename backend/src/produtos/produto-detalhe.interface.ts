export interface ProdutoDetalhe {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  precoVendaAtual: string;
  categoriaId: number;
  estoqueMinimo: string;
  perecivel: boolean;
  ativo: boolean;
}