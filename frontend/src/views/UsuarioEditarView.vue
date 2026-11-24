<script lang="ts">
import { defineComponent } from 'vue'
import { mapStores } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { requisitar, ErroApi } from '@/services/api'
import type { Estado, EnderecoUsuario, ItemGeografico, UsuarioDetalhe } from '@/types/api'

function formatarCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export default defineComponent({
  name: 'UsuarioEditarView',

  data() {
    return {
      usuario: null as UsuarioDetalhe | null,

      dados: { nome: '', email: '' },
      contato: { codigoPais: '', ddd: '', numero: '' },
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        cep: '',
        municipioId: null as number | null,
        bairroId: null as number | null,
        bairroNome: '',
      },

      estados: [] as Estado[],
      municipios: [] as ItemGeografico[],
      bairros: [] as ItemGeografico[],
      estadoId: null as number | null,
      digitarBairro: false,

      // Enquanto o formulário é preenchido com os dados atuais, os watch não limpam nada.
      preenchendo: false,

      carregando: false,
      salvando: false,
      erro: '',
      sucesso: '',
    }
  },

  computed: {
    ...mapStores(useAuthStore),

    usuarioId(): number {
      return Number(this.$route.params.id)
    },
  },

  watch: {
    estadoId() {
      if (this.preenchendo) {
        return
      }
      this.endereco.municipioId = null
      this.municipios = []
      this.bairros = []
      this.carregarMunicipios()
    },

    'endereco.municipioId'() {
      if (this.preenchendo) {
        return
      }
      this.endereco.bairroId = null
      this.bairros = []
      this.carregarBairros()
    },

    digitarBairro() {
      if (this.preenchendo) {
        return
      }
      this.endereco.bairroId = null
      this.endereco.bairroNome = ''
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
        const [usuario, estados] = await Promise.all([
          requisitar<UsuarioDetalhe>(`/usuarios/${this.usuarioId}`, {
            token: this.authStore.token,
          }),
          requisitar<Estado[]>('/estados'),
        ])
        this.usuario = usuario
        this.estados = estados

        this.dados.nome = usuario.nome
        this.dados.email = usuario.email

        const contato = usuario.contatos[0]
        if (contato) {
          this.contato.codigoPais = contato.codigoPais ?? ''
          this.contato.ddd = contato.ddd
          this.contato.numero = contato.numero
        }

        const endereco = usuario.enderecos[0]
        if (endereco) {
          await this.preencherEndereco(endereco)
        }
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
        this.usuario = null
      } finally {
        this.carregando = false
      }
    },

    // Preenche o endereço na ordem da cascata: estado → cidades → cidade → bairros → bairro.
    async preencherEndereco(endereco: EnderecoUsuario) {
      this.preenchendo = true

      this.estadoId = endereco.estadoId
      await this.carregarMunicipios()
      this.endereco.municipioId = endereco.municipioId
      await this.carregarBairros()

      this.endereco.logradouro = endereco.logradouro
      this.endereco.numero = endereco.numero ?? ''
      this.endereco.complemento = endereco.complemento ?? ''
      this.endereco.cep = endereco.cep
      this.digitarBairro = endereco.bairroId === null
      this.endereco.bairroId = endereco.bairroId
      this.endereco.bairroNome = endereco.bairroNome ?? ''

      await this.$nextTick()
      this.preenchendo = false
    },

    async carregarMunicipios() {
      if (this.estadoId === null) {
        return
      }
      this.municipios = await requisitar<ItemGeografico[]>(`/estados/${this.estadoId}/municipios`)
    },

    async carregarBairros() {
      const municipioId = this.endereco.municipioId
      if (municipioId === null) {
        return
      }
      this.bairros = await requisitar<ItemGeografico[]>(`/municipios/${municipioId}/bairros`)
      if (this.bairros.length === 0 && !this.preenchendo) {
        this.digitarBairro = true
      }
    },

    // Os três formulários usam o mesmo esqueleto de envio.
    async salvar(caminho: string, corpo: Record<string, unknown>, mensagem: string) {
      this.erro = ''
      this.sucesso = ''
      this.salvando = true
      try {
        await requisitar(caminho, { metodo: 'PATCH', corpo, token: this.authStore.token })
        this.sucesso = mensagem
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      } finally {
        this.salvando = false
      }
    },

    salvarDados() {
      this.salvar(
        `/usuarios/${this.usuarioId}`,
        { nome: this.dados.nome.trim(), email: this.dados.email.trim() },
        'Dados atualizados.',
      )
    },

    salvarContato() {
      const corpo: Record<string, unknown> = {
        ddd: apenasDigitos(this.contato.ddd),
        numero: apenasDigitos(this.contato.numero),
      }
      const codigoPais = apenasDigitos(this.contato.codigoPais)
      if (codigoPais) {
        corpo.codigoPais = codigoPais
      }
      this.salvar(`/usuarios/${this.usuarioId}/contato`, corpo, 'Contato atualizado.')
    },

    salvarEndereco() {
      const corpo: Record<string, unknown> = {
        logradouro: this.endereco.logradouro.trim(),
        cep: apenasDigitos(this.endereco.cep),
        municipioId: this.endereco.municipioId,
      }
      const numero = this.endereco.numero.trim()
      if (numero) {
        corpo.numero = numero
      }
      const complemento = this.endereco.complemento.trim()
      if (complemento) {
        corpo.complemento = complemento
      }
      if (this.digitarBairro) {
        corpo.bairroNome = this.endereco.bairroNome.trim()
      } else {
        corpo.bairroId = this.endereco.bairroId
      }
      this.salvar(`/usuarios/${this.usuarioId}/endereco`, corpo, 'Endereço atualizado.')
    },

    formatarCpf,
  },
})
</script>

<template>
  <main>
    <RouterLink to="/usuarios">← Voltar para os usuários</RouterLink>

    <p v-if="carregando && !usuario">Carregando...</p>
    <p v-else-if="!usuario" class="erro">{{ erro }}</p>

    <template v-else>
      <h1>Editar usuário</h1>

      <p>
        Login: <strong>{{ usuario.login }}</strong> · CPF: {{ formatarCpf(usuario.cpf) }}
        <br />
        <small>O login e o CPF identificam a pessoa e não podem ser alterados.</small>
      </p>

      <p v-if="erro" class="erro">{{ erro }}</p>
      <p v-if="sucesso" class="sucesso">{{ sucesso }}</p>

      <h2>Dados</h2>
      <form @submit.prevent="salvarDados">
        <label>
          Nome
          <input v-model="dados.nome" type="text" maxlength="255" />
        </label>
        <label>
          E-mail
          <input v-model="dados.email" type="email" maxlength="255" />
        </label>
        <button type="submit" :disabled="salvando">Salvar dados</button>
      </form>

      <h2>Contato</h2>
      <form v-if="usuario.contatos.length > 0" @submit.prevent="salvarContato">
        <label>
          Código do país
          <input v-model="contato.codigoPais" type="text" maxlength="3" />
        </label>
        <label>
          DDD
          <input v-model="contato.ddd" type="text" maxlength="2" />
        </label>
        <label>
          Telefone
          <input v-model="contato.numero" type="text" />
        </label>
        <button type="submit" :disabled="salvando">Salvar contato</button>
      </form>
      <p v-else>Este usuário não tem contato cadastrado.</p>

      <h2>Endereço</h2>
      <form v-if="usuario.enderecos.length > 0" @submit.prevent="salvarEndereco">
        <label>
          Estado
          <select v-model="estadoId">
            <option :value="null" disabled>Escolha o estado</option>
            <option v-for="estado in estados" :key="estado.id" :value="estado.id">
              {{ estado.nome }} ({{ estado.uf }})
            </option>
          </select>
        </label>

        <label>
          Cidade
          <select v-model="endereco.municipioId" :disabled="estadoId === null">
            <option :value="null" disabled>Escolha a cidade</option>
            <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.id">
              {{ municipio.nome }}
            </option>
          </select>
        </label>

        <label v-if="!digitarBairro">
          Bairro
          <select v-model="endereco.bairroId" :disabled="endereco.municipioId === null">
            <option :value="null" disabled>Escolha o bairro</option>
            <option v-for="bairro in bairros" :key="bairro.id" :value="bairro.id">
              {{ bairro.nome }}
            </option>
          </select>
        </label>
        <label v-else>
          Nome do bairro
          <input v-model="endereco.bairroNome" type="text" maxlength="255" />
        </label>

        <label>
          <span><input v-model="digitarBairro" type="checkbox" /> O bairro não está na lista</span>
        </label>

        <label>
          Logradouro
          <input v-model="endereco.logradouro" type="text" maxlength="255" />
        </label>
        <label>
          Número
          <input v-model="endereco.numero" type="text" maxlength="10" />
        </label>
        <label>
          Complemento
          <input v-model="endereco.complemento" type="text" maxlength="255" />
        </label>
        <label>
          CEP
          <input v-model="endereco.cep" type="text" maxlength="9" />
        </label>

        <button type="submit" :disabled="salvando">Salvar endereço</button>
      </form>
      <p v-else>Este usuário não tem endereço cadastrado.</p>
    </template>
  </main>
</template>
