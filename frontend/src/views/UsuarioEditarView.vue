<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import type { UsuarioDetalhe, UsuarioPublico } from '@/types/api'

function formatarCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

export default defineComponent({
  name: 'UsuarioEditarView',

  data() {
    return {
      usuario: null as UsuarioDetalhe | null,
      formulario: {
        nome: '',
        email: '',
      },
      carregando: false,
      erro: '',
    }
  },

  computed: {
    ...mapStores(useAuthStore),

    usuarioId(): number {
      return Number(this.$route.params.id)
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
        const usuario = await requisitar<UsuarioDetalhe>(`/usuarios/${this.usuarioId}`, {
          token: this.authStore.token,
        })
        this.usuario = usuario
        this.formulario.nome = usuario.nome
        this.formulario.email = usuario.email
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
        this.usuario = null
      } finally {
        this.carregando = false
      }
    },

    async enviar() {
      this.erro = ''
      this.carregando = true
      try {
        await requisitar<UsuarioPublico>(`/usuarios/${this.usuarioId}`, {
          metodo: 'PATCH',
          corpo: {
            nome: this.formulario.nome.trim(),
            email: this.formulario.email.trim(),
          },
          token: this.authStore.token,
        })
        await this.$router.push('/usuarios')
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      } finally {
        this.carregando = false
      }
    },

    formatarCpf,
  },
})
</script>

<template>
  <main>
    <RouterLink to="/usuarios">← Voltar para os usuários</RouterLink>

    <p v-if="carregando && !usuario">Carregando...</p>
    <p v-else-if="!usuario" class="erro">{{ erro }}</p>

    <template v-else>
      <h1>Editar usuário</h1>

      <p>
        Login: <strong>{{ usuario.login }}</strong> · CPF: {{ formatarCpf(usuario.cpf) }}
        <br />
        <small>O login e o CPF identificam a pessoa e não podem ser alterados.</small>
      </p>

      <form @submit.prevent="enviar">
        <label>
          Nome
          <input v-model="formulario.nome" type="text" maxlength="255" />
        </label>
        <label>
          E-mail
          <input v-model="formulario.email" type="email" maxlength="255" />
        </label>

        <p v-if="erro" class="erro">{{ erro }}</p>

        <button type="submit" :disabled="carregando">
          {{ carregando ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>

      <h2>Contatos</h2>
      <ul>
        <li v-for="contato in usuario.contatos" :key="contato.id">
          ({{ contato.ddd }}) {{ contato.numero }}
        </li>
      </ul>

      <h2>Endereços</h2>
      <ul>
        <li v-for="endereco in usuario.enderecos" :key="endereco.id">
          {{ endereco.logradouro }}<span v-if="endereco.numero">, {{ endereco.numero }}</span>
          <span v-if="endereco.complemento"> ({{ endereco.complemento }})</span>
          <span v-if="endereco.bairroNome"> · {{ endereco.bairroNome }}</span>
          · CEP {{ endereco.cep }}
        </li>
      </ul>
      <p>
        <small>A alteração de contato e endereço ainda não está disponível.</small>
      </p>
    </template>
  </main>
</template>
