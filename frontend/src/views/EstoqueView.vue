<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import ControlesPaginacao from '@/components/ControlesPaginacao.vue'
import type { EstoqueResumo, Paginado } from '@/types/api'
import { formatarQuantidade } from '@/utils/formatar'

export default defineComponent({
  name: 'EstoqueView',

  components: { ControlesPaginacao },

  data() {
    return {
      itens: [] as EstoqueResumo[],
      total: 0,
      pagina: 1,
      limite: 10,
      carregando: false,
      erro: '',
    }
  },

  computed: {
    ...mapStores(useAuthStore),
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
        const parametros = new URLSearchParams({
          pagina: String(this.pagina),
          limite: String(this.limite),
        })
        const resposta = await requisitar<Paginado<EstoqueResumo>>(
          `/estoque?${parametros.toString()}`,
          { token: this.authStore.token },
        )
        this.itens = resposta.dados
        this.total = resposta.total
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
        this.itens = []
        this.total = 0
      } finally {
        this.carregando = false
      }
    },

    irParaPagina(novaPagina: number) {
      this.pagina = novaPagina
      this.carregar()
    },

    formatarQuantidade,
  },
})
</script>

<template>
  <main>
    <h1>Estoque atual</h1>

    <p v-if="carregando">Carregando...</p>
    <p v-else-if="erro" class="erro">{{ erro }}</p>
    <p v-else-if="itens.length === 0">Nenhum produto cadastrado.</p>

    <template v-else>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Produto</th>
            <th>Quantidade total</th>
            <th>Mínimo</th>
            <th>Situação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in itens" :key="item.produtoId">
            <td>{{ item.codigo }}</td>
            <td>{{ item.nome }}</td>
            <td>{{ formatarQuantidade(item.quantidadeTotal) }}</td>
            <td>{{ formatarQuantidade(item.estoqueMinimo) }}</td>
            <td>
              <span v-if="item.abaixoDoMinimo" class="etiqueta">Abaixo do mínimo</span>
              <span v-if="!item.ativo" class="etiqueta">Inativo</span>
            </td>
            <td>
              <RouterLink :to="`/estoque/${item.produtoId}`">Ver detalhe</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>

      <ControlesPaginacao :pagina="pagina" :total="total" :limite="limite" @mudar="irParaPagina" />
    </template>
  </main>
</template>

<style scoped>
.etiqueta {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 4px;
  border-radius: 12px;
  font-size: 12px;
  background: #fef3c7;
}
</style>
