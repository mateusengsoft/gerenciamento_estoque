<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import type { Paginado, ProdutoListagem } from '@/types/api'
import { formatarPreco, formatarQuantidade } from '@/utils/formatar'

export default defineComponent({
  name: 'ProdutosView',

  data() {
    return {
      produtos: [] as ProdutoListagem[],
      carregando: false,
      erro: '',
      filtros: {
        nome: '',
        destaque: '',
        ativo: '',
      },
    }
  },

  computed: {
    ...mapStores(useAuthStore),
  },

  mounted() {
    this.carregar()
  },

  methods: {
    async carregar() {
      this.erro = ''
      this.carregando = true
      try {
        const resposta = await requisitar<Paginado<ProdutoListagem>>(this.montarCaminho(), {
          token: this.authStore.token,
        })

        this.produtos = resposta.dados
      } catch (erro) {
        this.erro =
          erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
      } finally {
        this.carregando = false
      }
    },

    async sair() {
      this.authStore.sair()
      await this.$router.push('/login')
    },

    formatarPreco,
    formatarQuantidade,

    montarCaminho(): string {
      const parametros = new URLSearchParams()
      const nome = this.filtros.nome.trim()
      if (nome) {
        parametros.set('nome', nome)
      }
      const destaque = this.filtros.destaque
      if (destaque) {
        parametros.set('destaque', destaque)
      }
      const ativo = this.filtros.ativo
      if (ativo) {
        parametros.set('ativo', ativo)
      }

      const texto = parametros.toString()
      return texto ? `/produtos?${texto}` : '/produtos'
    },

    limpar() {
      this.filtros.ativo = ''
      this.filtros.destaque = ''
      this.filtros.nome = ''
      this.carregar()
    },
  },
})
</script>

<template>
  <main>
    <header>
      <h1>Produtos</h1>
    </header>

    <form class="filtros" @submit.prevent="carregar">
      <input v-model="filtros.nome" type="text" placeholder="Buscar por nome" />

      <select v-model="filtros.destaque">
        <option value="">Todos os destaques</option>
        <option value="ESTOQUE_BAIXO">Estoque baixo</option>
        <option value="VENCENDO">Vencendo</option>
      </select>
      <select v-model="filtros.ativo">
        <option value="">Todos</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>

      <button type="submit">Filtrar</button>
      <button type="button" @click="limpar">Limpar</button>
    </form>

    <p v-if="carregando">Carregando...</p>
    <p v-else-if="erro" class="erro">{{ erro }}</p>

    <table v-else>
      <thead>
        <tr>
          <th>Código</th>
          <th>Nome</th>
          <th>Categoria</th>
          <th>Preço</th>
          <th>Estoque</th>
          <th>Situação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="produto in produtos" :key="produto.id">
          <td>{{ produto.codigo }}</td>
          <td>{{ produto.nome }}</td>
          <td>
            {{ produto.categoriaNome }}
          </td>
          <td>
            {{ formatarPreco(produto.precoVendaAtual) }}
          </td>
          <td>
            {{ formatarQuantidade(produto.quantidadeTotal) }}
          </td>
          <td>
            <span v-if="produto.estoqueBaixo" class="etiqueta">
              Estoque abaixo de {{ formatarQuantidade(produto.estoqueMinimo) }}</span
            >
            <span v-if="!produto.ativo" class="etiqueta">Inativo </span>
            <span v-if="produto.proximoDoVencimento" class="etiqueta">Vencendo </span>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="sair">Sair</button>
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
