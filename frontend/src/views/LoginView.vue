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
    <section class="apresentacao">
      <h1>Controle de Estoque</h1>
      <p>Olá! Que bom ter você de volta.</p>
      <p>Entre com o seu login para gerenciar os produtos, as entradas e as saídas do estoque.</p>

      <!-- Ilustração simples: uma estante com caixas, desenhada com retângulos. -->
      <svg class="ilustracao" viewBox="0 0 240 170" aria-hidden="true">
        <rect x="20" y="10" width="6" height="150" fill="#ede9fe" />
        <rect x="214" y="10" width="6" height="150" fill="#ede9fe" />
        <rect x="20" y="58" width="200" height="5" fill="#ede9fe" />
        <rect x="20" y="108" width="200" height="5" fill="#ede9fe" />
        <rect x="20" y="155" width="200" height="5" fill="#ede9fe" />

        <rect x="36" y="22" width="40" height="36" rx="2" fill="#fbbf24" />
        <rect x="80" y="32" width="30" height="26" rx="2" fill="#f59e0b" />
        <rect x="150" y="26" width="44" height="32" rx="2" fill="#fbbf24" />
        <rect x="44" y="80" width="34" height="28" rx="2" fill="#f59e0b" />
        <rect x="120" y="72" width="44" height="36" rx="2" fill="#fbbf24" />
        <rect x="168" y="84" width="28" height="24" rx="2" fill="#f59e0b" />
        <rect x="60" y="124" width="46" height="31" rx="2" fill="#fbbf24" />
        <rect x="140" y="130" width="34" height="25" rx="2" fill="#f59e0b" />

        <rect x="54" y="22" width="4" height="36" fill="#d97706" />
        <rect x="170" y="26" width="4" height="32" fill="#d97706" />
        <rect x="140" y="72" width="4" height="36" fill="#d97706" />
        <rect x="81" y="124" width="4" height="31" fill="#d97706" />
      </svg>
    </section>

    <section class="acesso">
      <h2>Acesso ao sistema</h2>

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
        </label>

        <label>
          <input v-model="mostrarSenha" type="checkbox" />
          Mostrar senha
        </label>

        <p v-if="erro" class="erro">{{ erro }}</p>

        <button type="submit" :disabled="!podeEnviar">
          {{ carregando ? 'Entrando...' : 'Acessar sistema' }}
        </button>
      </form>

      <p class="convite">
        Ainda não tem acesso? <RouterLink to="/cadastro">Criar conta</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 880px;
  margin: 64px auto;
  padding: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.apresentacao {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 40px;
  background: var(--cor-primaria);
  color: #fff;
}

.apresentacao h1 {
  margin: 0 0 8px;
  font-size: 30px;
}

.apresentacao p {
  margin: 0;
  line-height: 1.5;
}

.ilustracao {
  width: 100%;
  max-width: 300px;
  margin-top: auto;
  align-self: center;
}

.acesso {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
  padding: 48px 40px;
}

.acesso h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: var(--cor-texto-suave);
}

.acesso form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;
  margin: 0;
}

.acesso input[type='text'],
.acesso input[type='password'] {
  width: 100%;
  padding: 12px 4px;
  font-size: 16px;
  border: 0;
  border-bottom: 2px solid var(--cor-primaria);
  border-radius: 0;
}

.acesso button[type='submit'] {
  padding: 12px;
  margin-top: 8px;
}

.convite {
  margin: 0;
  font-size: 14px;
}


</style>
