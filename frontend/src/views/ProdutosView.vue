<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import type { Paginado, ProdutoListagem } from '@/types/api'

export default defineComponent({
  name: 'ProdutosView',

  data() {
    return {
      produtos: [] as ProdutoListagem[],
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
    async carregar() {
      this.erro = ''
      this.carregando = true
      try {
        const resposta = await requisitar<Paginado<ProdutoListagem>>('/produtos', {
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
  },
})
</script>

<template>
  <main>
    <header>
      <h1>Produtos</h1>
    </header>

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
            {{ produto.precoVendaAtual }}
          </td>
          <td>
            {{ produto.quantidadeTotal }}
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="sair">Sair</button>
  </main>
</template>
