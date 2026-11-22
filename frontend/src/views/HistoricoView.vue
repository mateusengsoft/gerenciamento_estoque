<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import ControlesPaginacao from '@/components/ControlesPaginacao.vue'
import type {
  Local,
  MotivoMovimentacao,
  MovimentacaoHistorico,
  Paginado,
  ProdutoListagem,
  TipoMovimentacao,
  UsuarioPublico,
} from '@/types/api'
import { formatarDataHora, formatarPreco, formatarQuantidade } from '@/utils/formatar'

const NOMES_TIPO: Record<string, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  TRANSFERENCIA: 'Transferência',
}

const NOMES_MOTIVO: Record<string, string> = {
  COMPRA: 'Compra',
  VENDA: 'Venda',
  PERDA: 'Perda',
  VENCIMENTO: 'Vencimento',
}

export default defineComponent({
  name: 'HistoricoView',

  data() {
    return {
      produtos: [] as ProdutoListagem[],
      usuarios: [] as UsuarioPublico[],
      locais: [] as Local[],
      movimentacoes: [] as MovimentacaoHistorico[],
      filtros: {
        produtoId: null as number | null,
        tipo: '' as TipoMovimentacao | '',
        motivo: '' as MotivoMovimentacao | '',
        usuarioId: null as number | null,
        quantidadeMinima: null as number | null,
        quantidadeMaxima: null as number | null,
        dataInicio: '',
        dataFim: '',
      },
      carregando: false,
      erro: '',
      pagina: 1,
      limite: 10,
      total: 0,
    }
  },

  components: { ControlesPaginacao },

  computed: {
    ...mapStores(useAuthStore),
  },

  async mounted() {
    await this.carregarListas()
    await this.carregarHistorico()
  },

  methods: {
    mensagemDeErro(erro: unknown): string {
      return erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
    },

    async carregarProdutos() {
      try {
        const token = this.authStore.token
        const resposta = await requisitar<Paginado<ProdutoListagem>>('/produtos?limite=100', {
          token,
        })
        this.produtos = resposta.dados
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      }
    },

    async carregarUsuarios() {
      const admin = this.authStore.ehAdmin
      if (!admin) {
        return
      }

      try {
        const token = this.authStore.token
        const resposta = await requisitar<Paginado<UsuarioPublico>>('/usuarios?limite=100', {
          token,
        })
        this.usuarios = resposta.dados
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      }
    },

    async carregarLocais() {
      try {
        const token = this.authStore.token
        const resposta = await requisitar<Local[]>('/locais', { token })
        this.locais = resposta
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      }
    },
    async carregarListas() {
      this.erro = ''
      this.carregando = true

      try {
        await Promise.all([this.carregarProdutos(), this.carregarLocais(), this.carregarUsuarios()])
      } finally {
        this.carregando = false
      }
    },

    montarCaminho(): string {
      const parametros = new URLSearchParams()
      const produtoId = this.filtros.produtoId
      if (produtoId !== null) {
        parametros.set('produtoId', produtoId.toString())
      }
      const tipo = this.filtros.tipo
      if (tipo) {
        parametros.set('tipo', tipo)
      }
      const motivo = this.filtros.motivo
      if (motivo) {
        parametros.set('motivo', motivo)
      }
      const usuarioId = this.filtros.usuarioId
      if (usuarioId !== null) {
        parametros.set('usuarioId', usuarioId.toString())
      }
      const quantidadeMin = this.filtros.quantidadeMinima
      if (quantidadeMin !== null && Number.isFinite(quantidadeMin)) {
        parametros.set('quantidadeMinima', quantidadeMin.toString())
      }
      const quantidadeMax = this.filtros.quantidadeMaxima
      if (quantidadeMax !== null && Number.isFinite(quantidadeMax)) {
        parametros.set('quantidadeMaxima', quantidadeMax.toString())
      }
      const dataInicio = this.filtros.dataInicio
      if (dataInicio) {
        parametros.set('dataInicio', dataInicio)
      }
      const dataFim = this.filtros.dataFim
      if (dataFim) {
        parametros.set('dataFim', dataFim)
      }
      parametros.set('pagina', this.pagina.toString())
      parametros.set('limite', this.limite.toString())

      return `/movimentacoes?${parametros.toString()}`
    },

    async carregarHistorico() {
      this.carregando = true
      try {
        const resposta = await requisitar<Paginado<MovimentacaoHistorico>>(this.montarCaminho(), {
          token: this.authStore.token,
        })
        this.movimentacoes = resposta.dados
        this.total = resposta.total
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      } finally {
        this.carregando = false
      }
    },

    async filtrar() {
      this.erro = ''
      this.pagina = 1
      await this.carregarHistorico()
    },

    async limpar() {
      this.erro = ''
      this.filtros.dataFim = ''
      this.filtros.dataInicio = ''
      this.filtros.motivo = ''
      this.filtros.produtoId = null
      this.filtros.quantidadeMaxima = null
      this.filtros.quantidadeMinima = null
      this.filtros.tipo = ''
      this.filtros.usuarioId = null
      this.pagina = 1
      await this.carregarHistorico()
    },

    async irParaPagina(novaPagina: number) {
      this.erro = ''
      this.pagina = novaPagina
      await this.carregarHistorico()
    },
    nomeDoTipo(tipo: TipoMovimentacao): string {
      return NOMES_TIPO[tipo] ?? tipo
    },

    nomeDoMotivo(motivo: MotivoMovimentacao | null): string {
      return motivo ? (NOMES_MOTIVO[motivo] ?? motivo) : '—'
    },

    descreverLocal(localId: number | null): string {
      if (localId === null) {
        return '—'
      }

      const local = this.locais.find((item) => item.id === localId)

      if (!local) {
        return 'Local não encontrado'
      }

      return `Corredor ${local.corredor}, Seção ${local.secao}, Prateleira ${local.prateleira}`
    },

    descreverLocais(movimentacao: MovimentacaoHistorico): string {
      if (movimentacao.tipo === 'TRANSFERENCIA') {
        return `${this.descreverLocal(movimentacao.localOrigemId)} → ${this.descreverLocal(movimentacao.localDestinoId)}`
      }

      const localId =
        movimentacao.tipo === 'ENTRADA' ? movimentacao.localDestinoId : movimentacao.localOrigemId

      return this.descreverLocal(localId)
    },
    formatarDataHora,
    formatarQuantidade,
    formatarPreco,
  },
})
</script>

<template>
  <main>
    <h1>Histórico de movimentações</h1>

    <p v-if="erro" class="erro">{{ erro }}</p>

    <section class="filtros">
      <h2>Filtros</h2>

      <form @submit.prevent="filtrar">
        <div>
          <label for="produto">Produto</label>
          <select id="produto" v-model="filtros.produtoId">
            <option :value="null">Todos os produtos</option>
            <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
              {{ produto.nome }}
            </option>
          </select>
        </div>

        <div>
          <label for="tipo">Tipo</label>
          <select id="tipo" v-model="filtros.tipo">
            <option value="">Todos os tipos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
            <option value="TRANSFERENCIA">Transferência</option>
          </select>
        </div>

        <div>
          <label for="motivo">Motivo</label>
          <select id="motivo" v-model="filtros.motivo">
            <option value="">Todos os motivos</option>
            <option value="COMPRA">Compra</option>
            <option value="VENDA">Venda</option>
            <option value="PERDA">Perda</option>
            <option value="VENCIMENTO">Vencimento</option>
          </select>
        </div>

        <div v-if="authStore.ehAdmin">
          <label for="usuario">Responsável</label>
          <select id="usuario" v-model="filtros.usuarioId">
            <option :value="null">Todos os usuários</option>
            <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
              {{ usuario.nome }}
            </option>
          </select>
        </div>

        <div>
          <label for="quantidadeMinima">Quantidade mínima</label>
          <input
            id="quantidadeMinima"
            v-model.number="filtros.quantidadeMinima"
            type="number"
            min="0"
            step="0.001"
          />
        </div>

        <div>
          <label for="quantidadeMaxima">Quantidade máxima</label>
          <input
            id="quantidadeMaxima"
            v-model.number="filtros.quantidadeMaxima"
            type="number"
            min="0"
            step="0.001"
          />
        </div>

        <div>
          <label for="dataInicio">Data inicial</label>
          <input id="dataInicio" v-model="filtros.dataInicio" type="date" />
        </div>

        <div>
          <label for="dataFim">Data final</label>
          <input id="dataFim" v-model="filtros.dataFim" type="date" />
        </div>

        <div class="acoes-filtro">
          <button type="submit" :disabled="carregando">Filtrar</button>

          <button type="button" :disabled="carregando" @click="limpar">Limpar filtros</button>
        </div>
      </form>
    </section>

    <section class="historico">
      <h2>Movimentações</h2>

      <p v-if="carregando">Carregando movimentações...</p>

      <p v-else-if="movimentacoes.length === 0">Nenhuma movimentação encontrada.</p>

      <div v-else class="tabela-container">
        <table>
          <thead>
            <tr>
              <th>Data e hora</th>
              <th>Tipo</th>
              <th>Motivo</th>
              <th>Produto</th>
              <th>Lote</th>
              <th>Quantidade</th>
              <th>Valor unitário</th>
              <th>Local</th>
              <th>Responsável</th>
              <th>Observação</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="movimentacao in movimentacoes" :key="movimentacao.id">
              <td>{{ formatarDataHora(movimentacao.dataMovimentacao) }}</td>
              <td>{{ nomeDoTipo(movimentacao.tipo) }}</td>
              <td>{{ nomeDoMotivo(movimentacao.motivo) }}</td>
              <td>{{ movimentacao.produtoNome }}</td>
              <td>{{ movimentacao.codigoLote }}</td>
              <td>{{ formatarQuantidade(movimentacao.quantidade) }}</td>
              <td>{{ formatarPreco(movimentacao.valorUnitario) }}</td>
              <td>{{ descreverLocais(movimentacao) }}</td>
              <td>{{ movimentacao.usuarioNome }}</td>
              <td>{{ movimentacao.observacao ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ControlesPaginacao
        v-if="total > 0"
        :pagina="pagina"
        :total="total"
        :limite="limite"
        @mudar="irParaPagina"
      />
    </section>
  </main>
</template>
<style scoped></style>
