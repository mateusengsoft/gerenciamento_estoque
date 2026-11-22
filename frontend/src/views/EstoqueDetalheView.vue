<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import type { EstoqueDetalhe } from '@/types/api'
import { formatarData, formatarQuantidade } from '@/utils/formatar'

function dataDaquiA30Dias(): string {
  const limite = new Date()
  limite.setDate(limite.getDate() + 30)
  const mes = String(limite.getMonth() + 1).padStart(2, '0')
  const dia = String(limite.getDate()).padStart(2, '0')
  return `${limite.getFullYear()}-${mes}-${dia}`
}

export default defineComponent({
  name: 'EstoqueDetalheView',

  data() {
    return {
      detalhe: null as EstoqueDetalhe | null,
      carregando: false,
      erro: '',
    }
  },

  computed: {
    ...mapStores(useAuthStore),

    produtoId(): number {
      return Number(this.$route.params.produtoId)
    },

    abaixoDoMinimo(): boolean {
      if (!this.detalhe) {
        return false
      }
      return Number(this.detalhe.quantidadeTotal) < Number(this.detalhe.estoqueMinimo)
    },
  },

  mounted() {
    this.carregar()
  },

  methods: {
    async carregar() {
      this.erro = ''
      this.carregando = true
      try {
        this.detalhe = await requisitar<EstoqueDetalhe>(`/estoque/${this.produtoId}`, {
          token: this.authStore.token,
        })
      } catch (erro) {
        this.erro =
          erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
        this.detalhe = null
      } finally {
        this.carregando = false
      }
    },

    venceEmBreve(dataVencimento: string | null): boolean {
      return dataVencimento !== null && dataVencimento <= dataDaquiA30Dias()
    },

    formatarData,
    formatarQuantidade,
  },
})
</script>

<template>
  <main>
    <RouterLink to="/estoque">← Voltar para o estoque</RouterLink>

    <p v-if="carregando">Carregando...</p>
    <p v-else-if="erro" class="erro">{{ erro }}</p>

    <template v-else-if="detalhe">
      <h1>{{ detalhe.codigo }} · {{ detalhe.nome }}</h1>

      <p>
        Total: <strong>{{ formatarQuantidade(detalhe.quantidadeTotal) }}</strong> · Mínimo:
        {{ formatarQuantidade(detalhe.estoqueMinimo) }}
        <span v-if="abaixoDoMinimo" class="etiqueta">Abaixo do mínimo</span>
        <span v-if="!detalhe.ativo" class="etiqueta">Inativo</span>
      </p>

      <p v-if="detalhe.posicoes.length === 0">Nenhuma unidade em estoque.</p>

      <table v-else>
        <thead>
          <tr>
            <th>Lote</th>
            <th>Vencimento</th>
            <th>Local</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="posicao in detalhe.posicoes" :key="`${posicao.loteId}-${posicao.localId}`">
            <td>{{ posicao.codigoLote }}</td>
            <td>
              {{ formatarData(posicao.dataVencimento) }}
              <span v-if="venceEmBreve(posicao.dataVencimento)" class="etiqueta">Vencendo</span>
            </td>
            <td>
              Corredor {{ posicao.corredor }}, Prateleira {{ posicao.prateleira }}, Seção
              {{ posicao.secao }}
            </td>
            <td>{{ formatarQuantidade(posicao.quantidade) }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </main>
</template>

<style scoped>
.etiqueta {
  display: inline-block;
  padding: 2px 8px;
  margin-left: 4px;
  border-radius: 12px;
  font-size: 12px;
  background: #fef3c7;
}
</style>
