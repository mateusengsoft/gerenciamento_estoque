<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ControlesPaginacao',

  props: {
    pagina: { type: Number, required: true },
    total: { type: Number, required: true },
    limite: { type: Number, required: true },
  },

  emits: ['mudar'],

  computed: {
    totalPaginas(): number {
      return Math.max(1, Math.ceil(this.total / this.limite))
    },
  },
})
</script>

<template>
  <div class="paginacao">
    <button type="button" :disabled="pagina <= 1" @click="$emit('mudar', pagina - 1)">
      Anterior
    </button>
    <span>Página {{ pagina }} de {{ totalPaginas }} ({{ total }} registros)</span>
    <button type="button" :disabled="pagina >= totalPaginas" @click="$emit('mudar', pagina + 1)">
      Próxima
    </button>
  </div>
</template>

<style scoped>
.paginacao {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
</style>
