import { defineStore } from 'pinia'
import { requisitar } from '@/services/api'

export type TipoUsuario = 'ADMINISTRADOR' | 'OPERADOR_ESTOQUE'

interface PayloadToken {
  sub: number
  tipo: TipoUsuario
  exp: number
}

const CHAVE_TOKEN = 'token'

// Lê o "meio" do JWT (o payload). Não confere a assinatura: só o backend pode fazer isso.
function lerPayload(token: string): PayloadToken | null {
  try {
    const parteDoMeio = token.split('.')[1] ?? ''
    const json = atob(parteDoMeio.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as PayloadToken
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(CHAVE_TOKEN),
  }),

  getters: {
    payload: (state): PayloadToken | null => (state.token ? lerPayload(state.token) : null),

    estaLogado(): boolean {
      return this.payload !== null && this.payload.exp * 1000 > Date.now()
    },

    ehAdmin(): boolean {
      return this.payload?.tipo === 'ADMINISTRADOR'
    },
  },

  actions: {
    async entrar(login: string, senha: string) {
      const resposta = await requisitar<{ accessToken: string }>('/auth/login', {
        metodo: 'POST',
        corpo: { login, senha },
      })
      this.token = resposta.accessToken
      localStorage.setItem(CHAVE_TOKEN, resposta.accessToken)
    },

    sair() {
      this.token = null
      localStorage.removeItem(CHAVE_TOKEN)
    },
  },
})
