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

    <span class="espaco"></span>
    <span>{{ authStore.ehAdmin ? 'Administrador' : 'Operador' }}</span>
    <button type="button" @click="sair">Sair</button>
  </nav>
</template>

<style scoped>
.barra {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid #ddd;
}
.espaco {
  flex: 1;
}
.router-link-active {
  font-weight: bold;
}
</style>
