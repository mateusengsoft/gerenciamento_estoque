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

export type TipoUsuario = 'ADMINISTRADOR' | 'OPERADOR_ESTOQUE'
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'TRANSFERENCIA'
export type MotivoMovimentacao = 'COMPRA' | 'VENDA' | 'PERDA' | 'VENCIMENTO'
export type MotivoSaida = 'VENDA' | 'PERDA' | 'VENCIMENTO'

export interface MovimentacaoHistorico {
  id: number
  tipo: TipoMovimentacao
  motivo: MotivoMovimentacao | null
  quantidade: string
  valorUnitario: string | null
  dataMovimentacao: string
  observacao: string | null
  produtoId: number
  produtoNome: string
  loteId: number
  codigoLote: string
  usuarioNome: string
  localOrigemId: number | null
  localDestinoId: number | null
}

export interface EstoqueResumo {
  produtoId: number
  codigo: string
  nome: string
  ativo: boolean
  quantidadeTotal: string
  estoqueMinimo: string
  abaixoDoMinimo: boolean
}

export interface PosicaoEstoque {
  loteId: number
  codigoLote: string
  dataVencimento: string | null
  localId: number
  corredor: string
  prateleira: string
  secao: string
  quantidade: string
}

export interface EstoqueDetalhe {
  produtoId: number
  codigo: string
  nome: string
  ativo: boolean
  quantidadeTotal: string
  estoqueMinimo: string
  posicoes: PosicaoEstoque[]
}

export interface Categoria {
  id: number
  nome: string
}

export interface UnidadeMedida {
  id: number
  nome: string
  sigla: string
}

export interface Estado {
  id: number
  nome: string
  uf: string
}

export interface ItemGeografico {
  id: number
  nome: string
}

export interface UsuarioPublico {
  id: number
  login: string
  nome: string
  email: string
  tipo: TipoUsuario
  ativo: boolean
}

export interface ProdutoDetalhe {
  id: number
  codigo: string
  nome: string
  descricao: string | null
  precoVendaAtual: string
  categoriaId: number
  estoqueMinimo: string
  perecivel: boolean
  ativo: boolean
}
