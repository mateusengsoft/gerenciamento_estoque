const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ErroApi extends Error {
  readonly status: number

  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.status = status
  }
}

interface OpcoesRequisicao {
  metodo?: 'GET' | 'POST' | 'PATCH'
  corpo?: unknown
  token?: string | null
}

let aoSessaoExpirar: (() => void) | null = null

export function definirAoSessaoExpirar(funcao: () => void) {
  aoSessaoExpirar = funcao
}

export async function requisitar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const cabecalhos: Record<string, string> = {}
  if (opcoes.corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json'
  }
  if (opcoes.token) {
    cabecalhos['Authorization'] = `Bearer ${opcoes.token}`
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: opcoes.metodo ?? 'GET',
    headers: cabecalhos,
    body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
  })

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    if (resposta.status === 401 && opcoes.token && aoSessaoExpirar) {
      aoSessaoExpirar()
    }
    const mensagem = Array.isArray(dados?.message)
      ? dados.message.join(' ')
      : (dados?.message ?? 'Erro ao comunicar com o servidor.')
    throw new ErroApi(resposta.status, mensagem)
  }

  return dados as T
}
