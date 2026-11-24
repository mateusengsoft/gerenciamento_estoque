<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import CampoMoeda from '@/components/CampoMoeda.vue'
import type { Categoria, Paginado, ProdutoDetalhe } from '@/types/api'

export default defineComponent({
  name: 'ProdutoEditarView',

  components: { CampoMoeda },

  data() {
    return {
      produto: null as ProdutoDetalhe | null,
      categorias: [] as Categoria[],

      formulario: {
        nome: '',
        descricao: '',
        precoVendaAtual: null as number | null,
        categoriaId: null as number | null,
        estoqueMinimo: null as number | null,
        ativo: true,
      },

      carregando: false,
      erro: '',
    }
  },

  computed: {
    ...mapStores(useAuthStore),

    produtoId(): number {
      return Number(this.$route.params.id)
    },
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
        const token = this.authStore.token
        const [produto, respostaCategorias] = await Promise.all([
          requisitar<ProdutoDetalhe>(`/produtos/${this.produtoId}`, { token }),
          requisitar<Paginado<Categoria>>('/categorias?limite=100', { token }),
        ])
        this.produto = produto
        this.categorias = respostaCategorias.dados

        // Preenche o formulário com os dados atuais. Os numeric chegam como texto.
        this.formulario.nome = produto.nome
        this.formulario.descricao = produto.descricao ?? ''
        this.formulario.precoVendaAtual = Number(produto.precoVendaAtual)
        this.formulario.categoriaId = produto.categoriaId
        this.formulario.estoqueMinimo = Number(produto.estoqueMinimo)
        this.formulario.ativo = produto.ativo
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
        this.produto = null
      } finally {
        this.carregando = false
      }
    },

    montarCorpo() {
      const corpo: Record<string, unknown> = {
        nome: this.formulario.nome.trim(),
        categoriaId: this.formulario.categoriaId,
        ativo: this.formulario.ativo,
      }
      if (Number.isFinite(this.formulario.precoVendaAtual)) {
        corpo.precoVendaAtual = this.formulario.precoVendaAtual
      }
      if (Number.isFinite(this.formulario.estoqueMinimo)) {
        corpo.estoqueMinimo = this.formulario.estoqueMinimo
      }
      const descricao = this.formulario.descricao.trim()
      if (descricao) {
        corpo.descricao = descricao
      }
      return corpo
    },

    async enviar() {
      this.erro = ''
      this.carregando = true
      try {
        await requisitar<{ id: number }>(`/produtos/${this.produtoId}`, {
          metodo: 'PATCH',
          corpo: this.montarCorpo(),
          token: this.authStore.token,
        })
        await this.$router.push('/produtos')
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      } finally {
        this.carregando = false
      }
    },
  },
})
</script>

<template>
  <main>
    <RouterLink to="/produtos">← Voltar para os produtos</RouterLink>

    <p v-if="carregando && !produto">Carregando...</p>
    <p v-else-if="!produto" class="erro">{{ erro }}</p>

    <template v-else>
      <h1>Editar produto</h1>

      <p>
        Código: <strong>{{ produto.codigo }}</strong> ·
        {{ produto.perecivel ? 'Perecível' : 'Não perecível' }}
        <br />
        <small>O código e o tipo (perecível) não podem ser alterados.</small>
      </p>

      <form @submit.prevent="enviar">
        <label>
          Nome
          <input v-model="formulario.nome" type="text" maxlength="50" />
        </label>

        <label>
          Descrição
          <input v-model="formulario.descricao" type="text" maxlength="255" />
        </label>

        <label>
          Preço de venda
          <CampoMoeda v-model="formulario.precoVendaAtual" />
        </label>

        <label>
          Categoria
          <select v-model="formulario.categoriaId">
            <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
              {{ categoria.nome }}
            </option>
          </select>
        </label>

        <label>
          Estoque mínimo
          <input v-model.number="formulario.estoqueMinimo" type="number" min="0" step="0.001" />
        </label>

        <label>
          <span><input v-model="formulario.ativo" type="checkbox" /> Produto ativo</span>
        </label>

        <p v-if="erro" class="erro">{{ erro }}</p>

        <button type="submit" :disabled="carregando">
          {{ carregando ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </form>
    </template>
  </main>
</template>
