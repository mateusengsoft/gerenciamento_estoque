export interface Paginado<T> {
  dados: T[]
  total: number
  pagina: number
  limite: number
}

export interface ProdutoListagem {
  id: number
  codigo: string
  nome: string
  categoriaNome: string
  precoVendaAtual: string
  ativo: boolean
  perecivel: boolean
  quantidadeTotal: string
  estoqueMinimo: string
  estoqueBaixo: boolean
  proximoDoVencimento: boolean
}

export interface FornecedorPublico {
  id: number
  nome: string
  cnpj: string
  email: string
  ativo: boolean
}

export interface Local {
  id: number
  corredor: string
  prateleira: string
  secao: string
}

export interface Lote {
  id: number
  codigoLote: string
  dataVencimento: string | null
  dataFabricacao: string
}
