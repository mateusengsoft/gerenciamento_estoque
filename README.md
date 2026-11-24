# Gerenciamento de Estoque

Sistema full stack de controle de estoque de alimentos para um supermercado, desenvolvido como desafio técnico do estágio na Norven.

O sistema controla produtos, lotes, locais de armazenamento, entradas (compras) e saídas (venda, perda e vencimento), com baixa por **FIFO** (o lote que entrou primeiro sai primeiro), histórico de movimentações que não pode ser apagado e dois perfis de acesso: **Administrador** e **Operador de estoque**.

## Sumário

1. [Tecnologias](#tecnologias)
2. [Pré-requisitos](#pré-requisitos)
3. [Como rodar](#como-rodar)
4. [Primeiro acesso](#primeiro-acesso)
5. [Funcionalidades](#funcionalidades)
6. [Perfis e permissões](#perfis-e-permissões)
7. [Arquitetura](#arquitetura)
8. [Regras de negócio](#regras-de-negócio)
9. [Rotas da API](#rotas-da-api)
10. [Scripts úteis](#scripts-úteis)
11. [Decisões e limitações](#decisões-e-limitações)
12. [Padrão de commits](#padrão-de-commits)

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Banco de dados | PostgreSQL 18 |
| Backend | NestJS 12, TypeScript, TypeORM (migrations em SQL), class-validator, JWT, bcrypt |
| Frontend | Vue 3 (**Options API**), TypeScript, Vue Router, Pinia, Vite |
| Testes e qualidade | Vitest, oxlint, ESLint, Prettier |
| Gerenciador de pacotes | pnpm |

## Pré-requisitos

- **Node.js** 22.18 ou mais recente (o projeto foi desenvolvido com o Node 26).
- **pnpm** (`npm install -g pnpm`).
- **PostgreSQL 18** rodando localmente.
- **Git**.

> No Windows, se o PowerShell bloquear o `pnpm` por política de execução, use `pnpm.cmd` no lugar de `pnpm`, ou rode os comandos pelo Git Bash.

## Como rodar

### 1. Clonar o repositório

```bash
git clone https://github.com/mateusengsoft/gerenciamento_estoque.git
cd gerenciamento_estoque
```

### 2. Criar o banco de dados

No PostgreSQL (pelo psql, DBeaver ou pgAdmin), crie um banco vazio:

```sql
create database gerenciamento_estoque;
```

### 3. Configurar e subir o backend

```bash
cd backend
cp .env.example .env
```

Preencha o `.env`:

| Variável | O que colocar |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_DATABASE` | Os dados de conexão do seu PostgreSQL (os valores do exemplo servem para uma instalação padrão) |
| `DB_PASSWORD` | A senha do usuário do PostgreSQL |
| `FRONTEND_URL` | O endereço do frontend, liberado no CORS (`http://localhost:5173`) |
| `ADMIN_LOGIN`, `ADMIN_NOME`, `ADMIN_EMAIL` | Os dados do primeiro administrador, criado pela seed |
| `ADMIN_CPF` | Um CPF **válido**, só os 11 dígitos (use um CPF gerado para testes, nunca um CPF real) |
| `ADMIN_SENHA` | A senha do primeiro administrador |
| `JWT_SECRET` | Um texto longo e aleatório, usado para assinar os tokens |
| `JWT_EXPIRES_IN` | A validade do token (`8h`) |

Depois, instale as dependências, crie as tabelas, carregue os dados iniciais e suba a API:

```bash
pnpm install
pnpm migration:run
pnpm seed
pnpm start:dev
```

A API fica em `http://localhost:3000`.

### 4. Configurar e subir o frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

O `.env` do frontend só tem o `VITE_API_URL`, o endereço da API (`http://localhost:3000`).

Abra `http://localhost:5173` no navegador.

## Primeiro acesso

1. Entre com o `ADMIN_LOGIN` e a `ADMIN_SENHA` definidos no `.env` do backend.
2. **Troque a senha do administrador** se o `.env` for compartilhado.
3. Para criar um operador: na tela de login, clique em **Criar conta**, faça o cadastro e, como administrador, ative a conta na tela **Usuários**.

### O que a seed carrega

| Dado | Conteúdo |
|---|---|
| Usuário `sistema` | Usuário técnico, inativo, dono dos dados de carga. Não aparece nas listagens e não faz login |
| Administrador | Criado a partir das variáveis `ADMIN_*` |
| Geografia | País, estados, municípios e bairros da base do IBGE ([chandez/Estados-Cidades-IBGE](https://github.com/chandez/Estados-Cidades-IBGE)) |
| Unidades de medida | Unidade, Quilograma, Grama, Litro, Mililitro, Caixa e Pacote |
| Categorias | Laticínios, Carnes, Grãos e Cereais, Bebidas, Hortifrúti, Padaria, Congelados e Mercearia |
| Locais | Corredores A e B × prateleiras 1 e 2 × seções 1 e 2 (8 locais) |

A seed pode ser rodada mais de uma vez: ela não duplica os dados.

### Cadastrar um fornecedor

O desafio pede telas apenas para os CRUDs listados (produtos, usuários e movimentações). Os fornecedores são cadastrados **pela API**, por um administrador. Exemplo, com dados fictícios:

```bash
# 1. Faça login e copie o accessToken da resposta
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","senha":"SUA_SENHA"}'

# 2. Cadastre o fornecedor
TOKEN=cole_o_token_aqui
curl -X POST http://localhost:3000/fornecedores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Laticínios Exemplo Ltda",
    "cnpj": "11222333000181",
    "email": "contato@exemplo.com",
    "endereco": {
      "logradouro": "Rua Exemplo",
      "numero": "100",
      "cep": "01001000",
      "municipioId": 1,
      "bairroNome": "Centro"
    },
    "contatos": [{ "ddd": "11", "numero": "40028922" }]
  }'
```

## Funcionalidades

| Tela | O que faz |
|---|---|
| **Login** | Entrada no sistema com login e senha, opção de mostrar a senha e link para o autocadastro |
| **Criar conta** | Autocadastro com dados pessoais, contato e endereço (estado → cidade → bairro). A conta nasce inativa e espera a ativação do administrador |
| **Produtos** | Listagem paginada com código, nome, categoria, preço, validade, estoque e status. Filtros por nome, preço, situação e destaque. Etiquetas para **estoque abaixo do mínimo** e **vencimento em até 30 dias** |
| **Novo produto / Editar produto** | Cadastro com o primeiro lote e os locais permitidos. Preço com máscara de moeda. Edição dos dados e do status (ativo ou inativo) |
| **Entrada** | Registro de compra: produto, fornecedor, lote existente ou novo, local de destino, quantidade, código da nota e valor unitário |
| **Saída** | Venda, perda ou vencimento, escolhendo o lote e o local de onde o produto sai |
| **Histórico** | Todas as movimentações, com filtros por produto, tipo, motivo, responsável, quantidade e período |
| **Estoque** | Saldo total por produto, com destaque para estoque baixo, e o detalhe por lote e local |
| **Usuários** | Listagem, ativação e desativação, troca de perfil e edição de dados, contato e endereço (somente administrador) |

## Perfis e permissões

| Ação | Administrador | Operador |
|---|:---:|:---:|
| Ver produtos, estoque e histórico | ✓ | ✓ |
| Registrar entradas e saídas | ✓ | ✓ |
| Cadastrar e editar produtos | ✓ | |
| Cadastrar fornecedores (API) | ✓ | |
| Gerenciar usuários | ✓ | |

As permissões são garantidas no **backend** (`JwtAuthGuard` + `PerfisGuard`). O frontend só esconde os botões e bloqueia as rotas para a navegação ficar coerente.

## Arquitetura

### Estrutura de pastas

```
gerenciamento_estoque/
├── backend/
│   └── src/
│       ├── auth/              # login, JWT, guards e o decorator @Perfis
│       ├── common/            # paginação, validador de CPF, interfaces comuns
│       ├── database/          # data-source, migrations (SQL) e seeds
│       ├── categorias/  fornecedores/  locais/  unidades-medida/  geografia/
│       ├── produtos/          # produtos, lotes e locais permitidos
│       ├── movimentacoes/     # entradas, saídas, histórico e saldos (FIFO)
│       ├── usuarios/  contatos/  enderecos/
│       └── main.ts
└── frontend/
    └── src/
        ├── assets/            # CSS global
        ├── components/        # barra de navegação, paginação, campo de moeda
        ├── router/            # rotas e navigation guard
        ├── services/          # cliente da API (fetch + tratamento de erros)
        ├── stores/            # Pinia (autenticação)
        ├── types/             # tipos das respostas da API
        ├── utils/             # formatação de preço, quantidade e data
        └── views/             # uma tela por arquivo
```

### Padrões obrigatórios

| Padrão | Onde está |
|---|---|
| **Repository Pattern** | Cada módulo tem o seu `*.repository.ts`, o único lugar que acessa o banco (consultas, transações e tradução dos erros do PostgreSQL em erros de domínio) |
| **Service Layer** | Os `*.service.ts` concentram as regras de negócio e traduzem os erros de domínio em respostas HTTP. Os controllers só recebem a requisição e chamam o service |
| **DTO** | Os `dto/*.dto.ts` validam toda entrada da API com class-validator. O `ValidationPipe` global recusa campos desconhecidos |
| **Singleton da conexão** | O `DataSource` do TypeORM, criado uma vez pelo `TypeOrmModule` e compartilhado por injeção de dependência em toda a aplicação |

## Regras de negócio

- **FIFO na saída:** cada entrada é uma aquisição com saldo próprio. A saída consome primeiro a aquisição mais antiga do lote e do local escolhidos, e uma saída pode ser dividida entre várias aquisições.
- **Transações:** toda entrada e saída roda numa transação, com bloqueio das linhas de saldo (`for update`). Se qualquer passo falhar, nada é gravado.
- **Saldo nunca negativo:** uma saída maior que o disponível é recusada.
- **Histórico imutável:** as movimentações não podem ser editadas nem apagadas. Cada uma registra o usuário, a data e hora e o tipo.
- **Locais permitidos:** um produto só entra nos locais autorizados no seu cadastro.
- **Perecíveis:** um produto perecível exige data de vencimento no lote. Para os não perecíveis, o vencimento é opcional.
- **Datas:** a data da movimentação não pode estar no futuro. O vencimento do lote precisa ser depois da fabricação.
- **Destaques:** estoque abaixo do mínimo e lotes com saldo vencendo em até 30 dias.
- **Usuários:** o autocadastro nasce inativo, o login e o CPF não podem ser alterados, e a senha é guardada com bcrypt. O token JWT não carrega dados pessoais.

## Rotas da API

Todas as rotas, exceto as públicas, exigem o cabeçalho `Authorization: Bearer <token>`. As listagens são paginadas (`?pagina=1&limite=10`, máximo de 100).

| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth/login` | Público |
| POST | `/usuarios` | Público (autocadastro) |
| GET | `/estados`, `/estados/:id/municipios`, `/municipios/:id/bairros` | Público |
| GET | `/usuarios`, `/usuarios/:id` | Administrador |
| PATCH | `/usuarios/:id`, `/usuarios/:id/ativacao`, `/usuarios/:id/contato`, `/usuarios/:id/endereco` | Administrador |
| GET | `/produtos`, `/produtos/:id`, `/produtos/:id/lotes`, `/produtos/:id/locais` | Autenticado |
| POST, PATCH | `/produtos`, `/produtos/:id` | Administrador |
| POST | `/movimentacoes/entradas`, `/movimentacoes/saidas` | Autenticado |
| GET | `/movimentacoes` | Autenticado |
| GET | `/estoque`, `/estoque/:produtoId` | Autenticado |
| GET | `/categorias`, `/categorias/:id`, `/locais`, `/unidades-medida`, `/fornecedores` | Autenticado |
| POST | `/fornecedores` | Administrador |

### Códigos de erro

| Código | Quando |
|---|---|
| 400 | Dados inválidos ou regra de negócio violada (ex.: saída maior que o saldo) |
| 401 | Sem token, token inválido ou expirado, ou login e senha incorretos |
| 403 | Usuário inativo ou sem permissão para a ação |
| 404 | Registro não encontrado |
| 409 | Registro duplicado (login, e-mail, CPF, código de produto) |

## Scripts úteis

| Pasta | Comando | O que faz |
|---|---|---|
| backend | `pnpm start:dev` | Sobe a API com recarga automática |
| backend | `pnpm build` | Compila o TypeScript |
| backend | `pnpm migration:run` | Cria as tabelas |
| backend | `pnpm migration:show` | Mostra quais migrations já rodaram |
| backend | `pnpm seed` | Carrega os dados iniciais |
| backend | `pnpm test` | Roda os testes unitários (Vitest) |
| backend | `pnpm lint` | Roda o oxlint |
| frontend | `pnpm dev` | Sobe o frontend em modo de desenvolvimento |
| frontend | `pnpm build` | Checa os tipos e gera a versão de produção |
| frontend | `pnpm lint` | Roda o oxlint e o ESLint |

## Decisões e limitações

- **Docker:** o PDF do desafio pede containers. A containerização foi **retirada do escopo pelo orientador**, e o projeto roda localmente, como descrito acima.
- **Vuetify:** opcional no desafio, não foi usado. As telas usam CSS próprio, num arquivo global (`frontend/src/assets/base.css`).
- **Fornecedores sem tela:** o desafio pede telas apenas para os CRUDs listados. Os fornecedores existem no banco e na API, e são usados na entrada de estoque.
- **Relatórios:** não há telas dedicadas de relatório. Os produtos que vencem em até 30 dias aparecem com a etiqueta **Vencendo** e no filtro de destaque da tela de Produtos. O rastreamento por lote (local e quantidade de cada lote) está no detalhe da tela Estoque.
- **Ficaram para uma próxima versão:** transferência entre locais, correção de lote, inativação de fornecedores, cadastro de categorias pela tela e telas de relatório.
- **Tela pensada para computador:** o layout não foi adaptado para celular.

## Padrão de commits

Os commits seguem o formato `<tipo>: <descrição>`, em inglês, com um assunto por commit:

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de erro |
| `refactor` | Mudança de código sem mudar o comportamento |
| `style` | Visual (CSS) |
| `docs` | Documentação |
| `test` | Testes |
| `build` | Dependências, configuração e estrutura do projeto |
