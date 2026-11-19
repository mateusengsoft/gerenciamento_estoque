<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import type {
  EstoqueDetalhe,
  MotivoSaida,
  Paginado,
  PosicaoEstoque,
  ProdutoListagem,
} from '@/types/api'
import { formatarData, formatarQuantidade, hojeLocal } from '@/utils/formatar'

export default defineComponent({
  name: 'SaidaView',

  data() {
    return {
      produtos: [] as ProdutoListagem[],
      posicoes: [] as PosicaoEstoque[],
      posicaoEscolhida: null as PosicaoEstoque | null,
      formulario: {
        produtoId: null as number | null,
        quantidade: null as number | null,
        motivo: 'VENDA' as MotivoSaida,
        valorUnitario: null as number | null,
        dataMovimentacao: hojeLocal(),
        observacao: '',
      },
      carregando: false,
      carregandoPosicoes: false,
      erro: '',
      sucesso: '',
    }
  },

  computed: {
    ...mapStores(useAuthStore),
  },

  watch: {
    'formulario.produtoId'() {
      this.posicaoEscolhida = null

      const produto = this.produtos.find((p) => p.id === this.formulario.produtoId)

      this.formulario.valorUnitario = produto ? Number(produto.precoVendaAtual) : null

      this.carregarPosicoes()
    },
  },

  mounted() {
    this.carregarProdutos()
  },

  methods: {
    mensagemDeErro(erro: unknown): string {
      return erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
    },

    async carregarProdutos() {
      try {
        const token = this.authStore.token
        const respostaProdutos = await requisitar<Paginado<ProdutoListagem>>(
          '/produtos?ativo=true&limite=100',
          { token },
        )
        this.produtos = respostaProdutos.dados
      } catch (erro) {
        this.erro = erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor'
      }
    },

    async carregarPosicoes() {
      this.posicoes = []
      this.erro = ''

      const produtoId = this.formulario.produtoId

      if (produtoId === null) {
        this.carregandoPosicoes = false
        return
      }

      this.carregandoPosicoes = true

      try {
        const token = this.authStore.token

        const resposta = await requisitar<EstoqueDetalhe>(`/estoque/${produtoId}`, { token })

        this.posicoes = resposta.posicoes
      } catch (erro) {
        this.erro =
          erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
      } finally {
        this.carregandoPosicoes = false
      }
    },

    montarCorpo() {
      if (this.posicaoEscolhida === null) {
        throw new Error('Escolha o lote e o local de onde sai o produto.')
      }
      const corpo: Record<string, unknown> = {
        loteId: this.posicaoEscolhida.loteId,
        localOrigemId: this.posicaoEscolhida.localId,
        quantidade: this.formulario.quantidade,
        motivo: this.formulario.motivo,
        dataMovimentacao: this.formulario.dataMovimentacao,
      }
      const observacao = this.formulario.observacao.trim()

      if (observacao) {
        corpo.observacao = observacao
      }
      const motivo = this.formulario.motivo
      if (motivo === 'VENDA') {
        corpo.valorUnitario = this.formulario.valorUnitario
      }
      return corpo
    },
    async enviar() {
      this.erro = ''
      this.sucesso = ''
      if (this.posicaoEscolhida === null) {
        this.erro = 'Escolha o lote e o local de onde sai o produto.'
        return
      }
      this.carregando = true
      try {
        await requisitar<{ movimentacaoId: number }>(`/movimentacoes/saidas`, {
          metodo: 'POST',
          corpo: this.montarCorpo(),
          token: this.authStore.token,
        })
        this.sucesso = 'Saída registrada'
        this.formulario.quantidade = null
        this.formulario.observacao = ''
        this.posicaoEscolhida = null
        await this.carregarPosicoes()
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      } finally {
        this.carregando = false
      }
    },

    formatarQuantidade,
    formatarData,
  },
})
</script>

<template>
  <main>
    <h1>Saida de estoque</h1>
    <form @submit.prevent="enviar">
      <label> Produto </label>
      <select v-model="formulario.produtoId">
        <option :value="null" disabled>Escolha um produto</option>
        <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
          {{ produto.codigo }} · {{ produto.nome }}
        </option>
      </select>
      <p v-if="formulario.produtoId === null">Selecione um produto primeiro.</p>

      <p v-else-if="carregandoPosicoes">Carregando posições de estoque...</p>

      <p v-else-if="posicoes.length === 0">Este produto está sem estoque.</p>
      <label v-else>
        Lote e local
        <select v-model="posicaoEscolhida">
          <option :value="null" disabled>Escolha de onde sai</option>
          <option
            v-for="posicao in posicoes"
            :key="`${posicao.loteId} - ${posicao.localId}`"
            :value="posicao"
          >
            {{ posicao.codigoLote }} · vence {{ formatarData(posicao.dataVencimento) }} · Corredor
            {{ posicao.corredor }}, Prateleira {{ posicao.prateleira }}, Seção {{ posicao.secao }} ·
            disponível {{ formatarQuantidade(posicao.quantidade) }}
          </option>
        </select>
      </label>

      <label>
        Motivo
        <select v-model="formulario.motivo">
          <option value="VENDA">Venda</option>
          <option value="PERDA">Perda</option>
          <option value="VENCIMENTO">Vencimento</option>
        </select>
      </label>

      <label v-if="formulario.motivo === 'VENDA'">
        Valor unitário
        <input v-model.number="formulario.valorUnitario" type="number" min="0" step="0.01" />
      </label>
      <label>
        Quantidade
        <input v-model.number="formulario.quantidade" type="number" min="0.001" step="0.001" />
        <small v-if="posicaoEscolhida"
          >Disponível: {{ formatarQuantidade(posicaoEscolhida.quantidade) }}</small
        >
      </label>
      <label>
        Data da Movimentação
        <input v-model="formulario.dataMovimentacao" type="date" />
      </label>

      <label>
        Observação
        <input type="text" v-model="formulario.observacao" />
      </label>

      <p v-if="erro" class="erro">{{ erro }}</p>
      <p v-if="sucesso" class="sucesso">{{ sucesso }}</p>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Registrando...' : 'Registrar saida' }}
      </button>
    </form>
  </main>
</template>

<style scoped></style>
