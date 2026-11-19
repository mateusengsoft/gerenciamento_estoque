<script lang="ts">
import { defineComponent } from 'vue'
import BarraNavegacao from '@/components/BarraNavegacao.vue'

export default defineComponent({
  name: 'App',

  components: { BarraNavegacao },

  computed: {
    mostrarBarra(): boolean {
      return !this.$route.meta.publica
    },
  },
})
</script>

<template>
  <BarraNavegacao v-if="mostrarBarra" />
  <RouterView />
</template>
