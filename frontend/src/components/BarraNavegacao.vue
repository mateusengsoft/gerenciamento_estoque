<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'BarraNavegacao',

  computed: {
    ...mapStores(useAuthStore),
  },

  methods: {
    async sair() {
      this.authStore.sair()
      await this.$router.push('/login')
    },
  },
})
</script>

<template>
  <nav class="barra">
    <RouterLink to="/produtos">Produtos</RouterLink>
    <RouterLink to="/entradas">Entrada</RouterLink>
    <RouterLink to="/saidas">Saída</RouterLink>
    <RouterLink to="/movimentacoes">Histórico</RouterLink>
    <RouterLink to="/estoque">Estoque</RouterLink>
    <RouterLink v-if="authStore.ehAdmin" to="/usuarios">Usuários</RouterLink>

    <span class="espaco"></span>
    <span class="perfil">{{ authStore.ehAdmin ? 'Administrador' : 'Operador' }}</span>
    <button type="button" @click="sair">Sair</button>
  </nav>
</template>

<style scoped>
.barra {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 32px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.barra a {
  padding: 6px 0;
  border-bottom: 2px solid transparent;
  color: var(--cor-texto-suave);
  font-weight: 500;
  text-decoration: none;
}

.barra a:hover {
  color: var(--cor-primaria);
}

.barra .router-link-active {
  color: var(--cor-primaria);
  border-bottom-color: var(--cor-primaria);
}

.espaco {
  flex: 1;
}

.perfil {
  font-size: 14px;
  color: var(--cor-texto-suave);
}
</style>
