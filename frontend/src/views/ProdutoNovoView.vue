<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import CampoMoeda from '@/components/CampoMoeda.vue'
import type { Categoria, Local, Paginado, UnidadeMedida } from '@/types/api'

export default defineComponent({
  name: 'ProdutoNovoView',

  components: { CampoMoeda },

  data() {
    return {
      categorias: [] as Categoria[],
      unidades: [] as UnidadeMedida[],
      locais: [] as Local[],

      formulario: {
        codigo: '',
        nome: '',
        descricao: '',
        precoVendaAtual: null as number | null,
        categoriaId: null as number | null,
        unidadeEstoqueId: null as number | null,
        unidadeConteudoId: null as number | null,
        quantidadeConteudo: null as number | null,
        perecivel: true,
        estoqueMinimo: null as number | null,
        locaisIds: [] as number[],
      },

      lote: {
        codigoLote: '',
        dataFabricacao: '',
        dataVencimento: '',
      },

      carregando: false,
      erro: '',
    }
  },

  computed: {
    ...mapStores(useAuthStore),
  },

  mounted() {
    this.carregarListas()
  },

  methods: {
    mensagemDeErro(erro: unknown): string {
      return erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
    },

    async carregarListas() {
      try {
        const token = this.authStore.token
        const [respostaCategorias, respostaUnidades, respostaLocais] = await Promise.all([
          requisitar<Paginado<Categoria>>('/categorias?limite=100', { token }),
          requisitar<UnidadeMedida[]>('/unidades-medida', { token }),
          requisitar<Local[]>('/locais', { token }),
        ])
        this.categorias = respostaCategorias.dados
        this.unidades = respostaUnidades
        this.locais = respostaLocais
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      }
    },

    montarCorpo() {
      const primeiroLote: Record<string, unknown> = {
        codigoLote: this.lote.codigoLote.trim(),
        dataFabricacao: this.lote.dataFabricacao,
      }
      if (this.lote.dataVencimento) {
        primeiroLote.dataVencimento = this.lote.dataVencimento
      }

      const corpo: Record<string, unknown> = {
        codigo: this.formulario.codigo.trim(),
        nome: this.formulario.nome.trim(),
        precoVendaAtual: this.formulario.precoVendaAtual,
        categoriaId: this.formulario.categoriaId,
        unidadeEstoqueId: this.formulario.unidadeEstoqueId,
        perecivel: this.formulario.perecivel,
        primeiroLote,
        locaisIds: this.formulario.locaisIds,
      }

      const descricao = this.formulario.descricao.trim()
      if (descricao) {
        corpo.descricao = descricao
      }
      if (Number.isFinite(this.formulario.estoqueMinimo)) {
        corpo.estoqueMinimo = this.formulario.estoqueMinimo
      }

      const temQuantidadeConteudo = Number.isFinite(this.formulario.quantidadeConteudo)
      const temUnidadeConteudo = this.formulario.unidadeConteudoId !== null
      if (temQuantidadeConteudo || temUnidadeConteudo) {
        corpo.unidadeConteudoId = this.formulario.unidadeConteudoId
        corpo.quantidadeConteudo = temQuantidadeConteudo ? this.formulario.quantidadeConteudo : null
      }

      return corpo
    },

    async enviar() {
      this.erro = ''
      this.carregando = true
      try {
        await requisitar<{ id: number }>('/produtos', {
          metodo: 'POST',
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
    <h1>Novo produto</h1>

    <form @submit.prevent="enviar">
      <label>
        Código
        <input v-model="formulario.codigo" type="text" maxlength="50" />
      </label>

      <label>
        Nome
        <input v-model="formulario.nome" type="text" maxlength="50" />
      </label>

      <label>
        Descrição (opcional)
        <input v-model="formulario.descricao" type="text" maxlength="255" />
      </label>

      <label>
        Preço de venda
        <CampoMoeda v-model="formulario.precoVendaAtual" />
      </label>

      <label>
        Categoria
        <select v-model="formulario.categoriaId">
          <option :value="null" disabled>Escolha uma categoria</option>
          <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
            {{ categoria.nome }}
          </option>
        </select>
      </label>

      <label>
        Unidade do estoque
        <select v-model="formulario.unidadeEstoqueId">
          <option :value="null" disabled>Escolha uma unidade</option>
          <option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">
            {{ unidade.nome }} ({{ unidade.sigla }})
          </option>
        </select>
      </label>

      <label>
        Conteúdo de cada unidade (opcional)
        <input v-model.number="formulario.quantidadeConteudo" type="number" min="0" step="0.001" />
      </label>

      <label>
        Unidade do conteúdo
        <select v-model="formulario.unidadeConteudoId">
          <option :value="null">Sem conteúdo</option>
          <option v-for="unidade in unidades" :key="unidade.id" :value="unidade.id">
            {{ unidade.nome }} ({{ unidade.sigla }})
          </option>
        </select>
      </label>

      <label>
        Estoque mínimo (opcional)
        <input v-model.number="formulario.estoqueMinimo" type="number" min="0" step="0.001" />
      </label>

      <label>
        <span><input v-model="formulario.perecivel" type="checkbox" /> Produto perecível</span>
      </label>

      <fieldset>
        <legend>Primeiro lote</legend>
        <label>
          Código do lote
          <input v-model="lote.codigoLote" type="text" maxlength="50" />
        </label>
        <label>
          Data de fabricação
          <input v-model="lote.dataFabricacao" type="date" />
        </label>
        <label>
          Data de vencimento
          <span v-if="formulario.perecivel">(obrigatória)</span>
          <input v-model="lote.dataVencimento" type="date" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Locais permitidos</legend>
        <label v-for="local in locais" :key="local.id">
          <span>
            <input v-model="formulario.locaisIds" type="checkbox" :value="local.id" />
            Corredor {{ local.corredor }}, Prateleira {{ local.prateleira }}, Seção
            {{ local.secao }}
          </span>
        </label>
      </fieldset>

      <p v-if="erro" class="erro">{{ erro }}</p>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Cadastrando...' : 'Cadastrar produto' }}
      </button>
      <RouterLink to="/produtos">Cancelar</RouterLink>
    </form>
  </main>
</template>
