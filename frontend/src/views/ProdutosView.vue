<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'ProdutosView',

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
  <main>
    <h1>Produtos</h1>
    <p>Logado como {{ authStore.ehAdmin ? 'administrador' : 'operador' }}.</p>
    <button @click="sair">Sair</button>
  </main>
</template>
