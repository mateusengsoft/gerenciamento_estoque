<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import ControlesPaginacao from '@/components/ControlesPaginacao.vue'
import type { Paginado, TipoUsuario, UsuarioPublico } from '@/types/api'

const NOMES_TIPO: Record<TipoUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  OPERADOR_ESTOQUE: 'Operador de estoque',
}

export default defineComponent({
  name: 'UsuariosView',

  components: { ControlesPaginacao },

  data() {
    return {
      usuarios: [] as UsuarioPublico[],
      total: 0,
      pagina: 1,
      limite: 10,
      carregando: false,
      processandoId: null as number | null,
      erro: '',
      tipos: Object.keys(NOMES_TIPO) as TipoUsuario[],
    }
  },

  computed: {
    ...mapStores(useAuthStore),

    meuId(): number | null {
      return this.authStore.payload?.sub ?? null
    },
  },

  mounted() {
    this.carregar()
  },

  methods: {
    mensagemDeErro(erro: unknown): string {
      return erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
    },

    async carregar() {
      this.erro = ''
      this.carregando = true
      try {
        const parametros = new URLSearchParams({
          pagina: String(this.pagina),
          limite: String(this.limite),
        })
        const resposta = await requisitar<Paginado<UsuarioPublico>>(
          `/usuarios?${parametros.toString()}`,
          { token: this.authStore.token },
        )
        this.usuarios = resposta.dados
        this.total = resposta.total
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
        this.usuarios = []
        this.total = 0
      } finally {
        this.carregando = false
      }
    },

    irParaPagina(novaPagina: number) {
      this.pagina = novaPagina
      this.carregar()
    },

    async atualizarAtivacao(
      usuario: UsuarioPublico,
      corpo: { ativo: boolean; tipo?: TipoUsuario },
    ) {
      this.erro = ''
      this.processandoId = usuario.id
      try {
        const atualizado = await requisitar<UsuarioPublico>(`/usuarios/${usuario.id}/ativacao`, {
          metodo: 'PATCH',
          corpo,
          token: this.authStore.token,
        })
        const indice = this.usuarios.findIndex((u) => u.id === atualizado.id)
        if (indice !== -1) {
          this.usuarios[indice] = atualizado
        }
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      } finally {
        this.processandoId = null
      }
    },

    alternarAtivo(usuario: UsuarioPublico) {
      this.atualizarAtivacao(usuario, { ativo: !usuario.ativo })
    },

    mudarTipo(usuario: UsuarioPublico, evento: Event) {
      const novoTipo = (evento.target as HTMLSelectElement).value as TipoUsuario
      this.atualizarAtivacao(usuario, { ativo: usuario.ativo, tipo: novoTipo })
    },

    nomeDoTipo(tipo: TipoUsuario): string {
      return NOMES_TIPO[tipo]
    },
  },
})
</script>

<template>
  <main>
    <h1>Usuários</h1>

    <p v-if="erro" class="erro">{{ erro }}</p>

    <p v-if="carregando">Carregando...</p>
    <p v-else-if="usuarios.length === 0">Nenhum usuário encontrado.</p>

    <template v-else>
      <table>
        <thead>
          <tr>
            <th>Login</th>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Tipo</th>
            <th>Situação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td>{{ usuario.login }}</td>
            <td>{{ usuario.nome }}</td>
            <td>{{ usuario.email }}</td>
            <td>
              <span v-if="usuario.id === meuId">{{ nomeDoTipo(usuario.tipo) }}</span>
              <select
                v-else
                :value="usuario.tipo"
                :disabled="processandoId === usuario.id"
                @change="mudarTipo(usuario, $event)"
              >
                <option v-for="tipo in tipos" :key="tipo" :value="tipo">
                  {{ nomeDoTipo(tipo) }}
                </option>
              </select>
            </td>
            <td>{{ usuario.ativo ? 'Ativo' : 'Aguardando ativação / inativo' }}</td>
            <td>
              <button
                v-if="usuario.id !== meuId"
                type="button"
                :disabled="processandoId === usuario.id"
                @click="alternarAtivo(usuario)"
              >
                {{ usuario.ativo ? 'Desativar' : 'Ativar' }}
              </button>
              <RouterLink :to="`/usuarios/${usuario.id}/editar`">Editar</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>

      <ControlesPaginacao :pagina="pagina" :total="total" :limite="limite" @mudar="irParaPagina" />
    </template>
  </main>
</template>
