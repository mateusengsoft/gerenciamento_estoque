<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import CampoMoeda from '@/components/CampoMoeda.vue'
import type { FornecedorPublico, Local, Lote, Paginado, ProdutoListagem } from '@/types/api'
import { formatarData, hojeLocal } from '@/utils/formatar'

export default defineComponent({
  name: 'EntradaView',

  components: { CampoMoeda },

  data() {
    return {
      produtos: [] as ProdutoListagem[],
      fornecedores: [] as FornecedorPublico[],
      lotes: [] as Lote[],
      locais: [] as Local[],

      formulario: {
        produtoId: null as number | null,
        fornecedorId: null as number | null,
        loteId: null as number | null,
        localDestinoId: null as number | null,
        codigoAquisicao: '',
        quantidade: null as number | null,
        valorUnitario: null as number | null,
        dataMovimentacao: hojeLocal(),
        observacao: '',
      },

      modoLote: 'existente' as 'existente' | 'novo',

      novoLote: {
        codigoLote: '',
        dataFabricacao: '',
        dataVencimento: '',
      },

      carregando: false,
      sucesso: '',

      erro: '',
    }
  },

  computed: {
    ...mapStores(useAuthStore),
  },

  watch: {
    'formulario.produtoId'() {
      this.formulario.loteId = null
      this.formulario.localDestinoId = null
      this.carregarDadosDoProduto()
    },
  },

  mounted() {
    this.carregarListas()
  },

  methods: {
    async carregarListas() {
      try {
        const token = this.authStore.token
        const [respostaProdutos, respostaFornecedores] = await Promise.all([
          requisitar<Paginado<ProdutoListagem>>('/produtos?ativo=true&limite=100', { token }),
          requisitar<Paginado<FornecedorPublico>>('/fornecedores?limite=100', { token }),
        ])
        this.produtos = respostaProdutos.dados
        this.fornecedores = respostaFornecedores.dados
      } catch (erro) {
        this.erro =
          erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
      }
    },

    async carregarDadosDoProduto() {
      this.lotes = []
      this.locais = []
      const produtoId = this.formulario.produtoId
      if (produtoId === null) {
        return
      }
      try {
        const token = this.authStore.token
        const [respostaLotes, RespostaLocais] = await Promise.all([
          requisitar<Lote[]>(`/produtos/${produtoId}/lotes`, { token }),
          requisitar<Local[]>(`/produtos/${produtoId}/locais`, { token }),
        ])
        this.lotes = respostaLotes
        this.locais = RespostaLocais
      } catch (erro) {
        this.erro =
          erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
      }
    },
    montarCorpo() {
      const corpo: Record<string, unknown> = {
        produtoId: this.formulario.produtoId,
        fornecedorId: this.formulario.fornecedorId,
        codigoAquisicao: this.formulario.codigoAquisicao.trim(),
        quantidade: this.formulario.quantidade,
        valorUnitario: this.formulario.valorUnitario,
        localDestinoId: this.formulario.localDestinoId,
        dataMovimentacao: this.formulario.dataMovimentacao,
      }
      const dataVencimento = this.novoLote.dataVencimento
      const observacao = this.formulario.observacao.trim()
      if (observacao) {
        corpo.observacao = observacao
      }
      const modoLote = this.modoLote
      if (modoLote === 'existente') {
        corpo.loteId = this.formulario.loteId
      }
      if (modoLote === 'novo') {
        const novo: Record<string, unknown> = {
          codigoLote: this.novoLote.codigoLote.trim(),
          dataFabricacao: this.novoLote.dataFabricacao,
        }
        if (dataVencimento) {
          novo.dataVencimento = dataVencimento
        }
        corpo.novoLote = novo
      }
      return corpo
    },

    async enviar() {
      this.erro = ''
      this.sucesso = ''
      this.carregando = true
      try {
        await requisitar<{ movimentacaoId: number; aquisicaoId: number; loteId: number }>(
          '/movimentacoes/entradas',
          {
            metodo: 'POST',
            corpo: this.montarCorpo(),
            token: this.authStore.token,
          },
        )
        this.sucesso = 'Entrada registrada.'
        this.formulario.produtoId = null
        this.formulario.quantidade = null
        this.formulario.valorUnitario = null
        this.formulario.observacao = ''
        this.novoLote.codigoLote = ''
        this.novoLote.dataFabricacao = ''
        this.novoLote.dataVencimento = ''
        this.modoLote = 'existente'
      } catch (erro) {
        if (erro instanceof ErroApi) {
          this.erro = erro.message
        } else {
          this.erro = 'Não foi possível conectar ao servidor. Verifique se ele está rodando.'
        }
      } finally {
        this.carregando = false
      }
    },
    hojeLocal,
    formatarData,
  },
})
</script>

<template>
  <main>
    <h1>Entrada de estoque</h1>

    <form @submit.prevent="enviar">
      <label>
        Produto
        <select v-model="formulario.produtoId">
          <option :value="null" disabled>Escolha um produto</option>
          <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
            {{ produto.codigo }} · {{ produto.nome }}
          </option>
        </select>
      </label>
      <label>
        Fornecedor
        <select v-model="formulario.fornecedorId">
          <option :value="null" disabled>Escolha um fornecedor</option>
          <option v-for="fornecedor in fornecedores" :key="fornecedor.id" :value="fornecedor.id">
            {{ fornecedor.nome }}
          </option>
        </select>
      </label>
      <label>
        Local Destino
        <select v-model="formulario.localDestinoId">
          <option :value="null" disabled>Escolha o local de destino</option>
          <option v-for="local in locais" :key="local.id" :value="local.id">
            Corredor {{ local.corredor }} · Prateleira {{ local.prateleira }} · Seção
            {{ local.secao }}
          </option>
        </select>
      </label>
      <fieldset>
        <legend>Lote</legend>
        <label><input v-model="modoLote" type="radio" value="existente" /> Lote existente</label>
        <label><input v-model="modoLote" type="radio" value="novo" /> Lote novo</label>
        <select v-if="modoLote === 'existente'" v-model="formulario.loteId">
          <option :value="null" disabled>Escolha um lote</option>
          <option v-for="lote in lotes" :key="lote.id" :value="lote.id">
            {{ lote.codigoLote }} · {{ formatarData(lote.dataVencimento) }}
          </option>
        </select>
        <section v-if="modoLote === 'novo'">
          <label for="codigoLote"> Código Lote</label>
          <input type="text" v-model="novoLote.codigoLote" id="codigoLote" />
          <label for="dataFabricacao"> Data de Fabricação</label>
          <input
            type="date"
            v-model="novoLote.dataFabricacao"
            placeholder="Digite a data de  fabricação do lote"
            id="dataFabricacao"
          />
          <label for="dataVencimento"> Data de Vencimento</label>
          <input
            type="date"
            v-model="novoLote.dataVencimento"
            placeholder="Digite a data de vencimento"
            id="dataVencimento"
          />
        </section>
      </fieldset>
      <label for="quantidade">
        Quantidade
        <input
          v-model.number="formulario.quantidade"
          type="number"
          min="0"
          step="0.001"
          id="quantidade"
        />
      </label>

      <label for="codigoAquisicao">
        Codigo de Aquisição
        <input type="text" v-model="formulario.codigoAquisicao" />
      </label>

      <label for="valorUnitario">
        Valor Unitário
        <CampoMoeda v-model="formulario.valorUnitario" id="valorUnitario" />
      </label>

      <label for="dataMovimentacao">
        Data da Movimentação
        <input v-model="formulario.dataMovimentacao" type="date" id="dataMovimentacao" />
      </label>

      <label for="observacao">
        Observação
        <input type="text" id="observacao" v-model="formulario.observacao" />
      </label>

      <p v-if="erro" class="erro">{{ erro }}</p>
      <p v-if="sucesso" class="sucesso">{{ sucesso }}</p>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Registrando...' : 'Registrar entrada' }}
      </button>
    </form>
  </main>
</template>
