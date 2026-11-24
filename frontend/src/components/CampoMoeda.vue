<script lang="ts">
import { defineComponent, type PropType } from 'vue'

function formatar(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default defineComponent({
  name: 'CampoMoeda',

  props: {
    modelValue: { type: Number as PropType<number | null>, default: null },
  },

  emits: ['update:modelValue'],

  computed: {
    textoExibido(): string {
      return this.modelValue === null ? '' : formatar(this.modelValue)
    },
  },

  methods: {
    // Cada dígito empurra os anteriores para a esquerda: 5 → 0,05; 59 → 0,59; 599 → 5,99.
    aoDigitar(evento: Event) {
      const campo = evento.target as HTMLInputElement
      const digitos = campo.value.replace(/\D/g, '')

      if (digitos === '') {
        campo.value = ''
        this.$emit('update:modelValue', null)
        return
      }

      const valor = Number(digitos) / 100
      campo.value = formatar(valor)
      this.$emit('update:modelValue', valor)
    },
  },
})
</script>

<template>
  <input
    type="text"
    inputmode="numeric"
    placeholder="R$ 0,00"
    :value="textoExibido"
    @input="aoDigitar"
  />
</template>
