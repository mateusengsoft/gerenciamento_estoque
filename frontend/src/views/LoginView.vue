<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ErroApi } from '@/services/api'

export default defineComponent({
  name: 'LoginView',

  data() {
    return {
      login: '',
      senha: '',
      erro: '',
      carregando: false,
      mostrarSenha: false,
    }
  },

  computed: {
    ...mapStores(useAuthStore),

    podeEnviar(): boolean {
      return this.login.trim() !== '' && this.senha !== '' && !this.carregando
    },
  },

  methods: {
    async enviar() {
      this.erro = ''
      this.carregando = true
      try {
        await this.authStore.entrar(this.login.trim(), this.senha)
        await this.$router.push('/produtos')
      } catch (erro) {
        if (erro instanceof ErroApi) {
          this.erro = erro.message
        } else {
          this.erro = 'Não foi possível conectar ao servidor. Verifique se ele está rodando.'
        }
      } finally {
        this.carregando = false
      }
    },
  },
})
</script>

<template>
  <main class="login">
    <h1>Controle de Estoque</h1>

    <form @submit.prevent="enviar">
      <label>
        Login
        <input v-model="login" type="text" autocomplete="username" />
      </label>

      <label>
        Senha
        <input
          v-model="senha"
          :type="mostrarSenha ? 'text' : 'password'"
          autocomplete="current-password"
        />
        <label class="mostrar-senha">
          <input v-model="mostrarSenha" type="checkbox" />
        </label>
      </label>

      <p v-if="erro" class="erro">{{ erro }}</p>

      <button type="submit" :disabled="!podeEnviar">
        {{ carregando ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
    <p>Ainda não tem acesso? <RouterLink to="/cadastro">Criar conta</RouterLink></p>
  </main>
</template>

<style scoped>
.login {
  max-width: 320px;
  margin: 80px auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.erro {
  color: #b42318;
}
</style>
