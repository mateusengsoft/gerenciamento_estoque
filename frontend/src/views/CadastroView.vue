<script lang="ts">
import { defineComponent } from 'vue'
import { requisitar, ErroApi } from '@/services/api'
import type { Estado, ItemGeografico } from '@/types/api'

// Tira tudo o que não é dígito: '529.982.247-25' vira '52998224725'.
function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export default defineComponent({
  name: 'CadastroView',

  data() {
    return {
      estados: [] as Estado[],
      municipios: [] as ItemGeografico[],
      bairros: [] as ItemGeografico[],

      estadoId: null as number | null,
      digitarBairro: false,
      confirmacaoSenha: '',

      formulario: {
        login: '',
        senha: '',
        nome: '',
        email: '',
        cpf: '',
        contato: {
          codigoPais: '55',
          ddd: '',
          numero: '',
        },
        endereco: {
          logradouro: '',
          numero: '',
          complemento: '',
          cep: '',
          municipioId: null as number | null,
          bairroId: null as number | null,
          bairroNome: '',
        },
      },

      carregando: false,
      erro: '',
      cadastrado: false,
    }
  },

  watch: {
    // Trocou o estado: a cidade e o bairro escolhidos deixam de valer.
    estadoId() {
      this.formulario.endereco.municipioId = null
      this.municipios = []
      this.bairros = []
      this.carregarMunicipios()
    },

    // Trocou a cidade: o bairro escolhido deixa de valer.
    'formulario.endereco.municipioId'() {
      this.formulario.endereco.bairroId = null
      this.bairros = []
      this.carregarBairros()
    },

    // Trocou entre escolher e digitar o bairro: limpa o outro jeito.
    digitarBairro() {
      this.formulario.endereco.bairroId = null
      this.formulario.endereco.bairroNome = ''
    },
  },

  mounted() {
    this.carregarEstados()
  },

  methods: {
    mensagemDeErro(erro: unknown): string {
      return erro instanceof ErroApi ? erro.message : 'Não foi possível conectar ao servidor.'
    },

    async carregarEstados() {
      try {
        this.estados = await requisitar<Estado[]>('/estados')
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      }
    },

    async carregarMunicipios() {
      if (this.estadoId === null) {
        return
      }
      try {
        this.municipios = await requisitar<ItemGeografico[]>(`/estados/${this.estadoId}/municipios`)
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      }
    },

    async carregarBairros() {
      const municipioId = this.formulario.endereco.municipioId
      if (municipioId === null) {
        return
      }
      try {
        this.bairros = await requisitar<ItemGeografico[]>(`/municipios/${municipioId}/bairros`)
        if (this.bairros.length === 0) {
          this.digitarBairro = true
        }
      } catch (erro) {
        this.erro = this.mensagemDeErro(erro)
      }
    },

    montarCorpo() {
      const f = this.formulario

      const endereco: Record<string, unknown> = {
        logradouro: f.endereco.logradouro.trim(),
        cep: apenasDigitos(f.endereco.cep),
        municipioId: f.endereco.municipioId,
      }
      const numero = f.endereco.numero.trim()
      if (numero) {
        endereco.numero = numero
      }
      const complemento = f.endereco.complemento.trim()
      if (complemento) {
        endereco.complemento = complemento
      }

      if (this.digitarBairro) {
        endereco.bairroNome = f.endereco.bairroNome.trim()
      } else {
        endereco.bairroId = f.endereco.bairroId
      }

      return {
        login: f.login.trim(),
        senha: f.senha,
        nome: f.nome.trim(),
        email: f.email.trim(),
        cpf: apenasDigitos(f.cpf),
        contato: {
          codigoPais: apenasDigitos(f.contato.codigoPais) || undefined,
          ddd: apenasDigitos(f.contato.ddd),
          numero: apenasDigitos(f.contato.numero),
        },
        endereco,
      }
    },

    async enviar() {
      this.erro = ''

      if (this.formulario.senha !== this.confirmacaoSenha) {
        this.erro = 'A senha e a confirmação não são iguais.'
        return
      }

      this.carregando = true
      try {
        await requisitar('/usuarios', {
          metodo: 'POST',
          corpo: this.montarCorpo(),
        })
        this.cadastrado = true
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
  <main class="cadastro">
    <h1>Criar conta</h1>

    <template v-if="cadastrado">
      <p class="sucesso">
        Cadastro enviado. Aguarde a ativação pelo administrador para entrar no sistema.
      </p>
      <RouterLink to="/login">Voltar para o login</RouterLink>
    </template>

    <form v-else @submit.prevent="enviar">
      <fieldset>
        <legend>Acesso</legend>
        <label>
          Login
          <input v-model="formulario.login" type="text" maxlength="20" autocomplete="username" />
        </label>
        <label>
          Senha (mínimo de 8 caracteres)
          <input
            v-model="formulario.senha"
            type="password"
            minlength="8"
            maxlength="72"
            autocomplete="new-password"
          />
        </label>
        <label>
          Confirme a senha
          <input v-model="confirmacaoSenha" type="password" autocomplete="new-password" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Dados pessoais</legend>
        <label>
          Nome completo
          <input v-model="formulario.nome" type="text" maxlength="255" />
        </label>
        <label>
          E-mail
          <input v-model="formulario.email" type="email" maxlength="255" />
        </label>
        <label>
          CPF
          <input v-model="formulario.cpf" type="text" placeholder="000.000.000-00" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Contato</legend>
        <label>
          Código do país
          <input v-model="formulario.contato.codigoPais" type="text" maxlength="3" />
        </label>
        <label>
          DDD
          <input v-model="formulario.contato.ddd" type="text" maxlength="2" placeholder="11" />
        </label>
        <label>
          Telefone
          <input v-model="formulario.contato.numero" type="text" placeholder="98765-4321" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Endereço</legend>

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
          <select v-model="formulario.endereco.municipioId" :disabled="estadoId === null">
            <option :value="null" disabled>
              {{ estadoId === null ? 'Escolha o estado primeiro' : 'Escolha a cidade' }}
            </option>
            <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.id">
              {{ municipio.nome }}
            </option>
          </select>
        </label>

        <label v-if="!digitarBairro">
          Bairro
          <select
            v-model="formulario.endereco.bairroId"
            :disabled="formulario.endereco.municipioId === null"
          >
            <option :value="null" disabled>Escolha o bairro</option>
            <option v-for="bairro in bairros" :key="bairro.id" :value="bairro.id">
              {{ bairro.nome }}
            </option>
          </select>
        </label>
        <label v-else>
          Nome do bairro
          <input v-model="formulario.endereco.bairroNome" type="text" maxlength="255" />
        </label>

        <label>
          <span
            ><input v-model="digitarBairro" type="checkbox" /> Meu bairro não está na lista</span
          >
        </label>

        <label>
          Logradouro (rua, avenida...)
          <input v-model="formulario.endereco.logradouro" type="text" maxlength="255" />
        </label>
        <label>
          Número (opcional)
          <input v-model="formulario.endereco.numero" type="text" maxlength="10" />
        </label>
        <label>
          Complemento (opcional)
          <input v-model="formulario.endereco.complemento" type="text" maxlength="255" />
        </label>
        <label>
          CEP
          <input
            v-model="formulario.endereco.cep"
            type="text"
            maxlength="9"
            placeholder="00000-000"
          />
        </label>
      </fieldset>

      <p v-if="erro" class="erro">{{ erro }}</p>

      <button type="submit" :disabled="carregando">
        {{ carregando ? 'Enviando...' : 'Criar conta' }}
      </button>
      <RouterLink to="/login">Já tenho conta</RouterLink>
    </form>
  </main>
</template>

<style scoped>
.cadastro {
  max-width: 720px;
}
</style>
