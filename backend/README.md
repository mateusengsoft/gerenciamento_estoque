# Backend: API do Gerenciamento de Estoque

API REST em **NestJS** com **TypeORM** e **PostgreSQL**.

> O passo a passo completo para rodar o projeto (banco, backend e frontend), as regras de negócio e as decisões estão no [README principal](../README.md).

## Como rodar

```bash
cp .env.example .env   # preencha as variáveis (explicadas no README principal)
pnpm install
pnpm migration:run     # cria as tabelas
pnpm seed              # carrega os dados iniciais
pnpm start:dev         # sobe a API em http://localhost:3000
```

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm start:dev` | Sobe a API com recarga automática |
| `pnpm start` | Sobe a API sem recarga automática |
| `pnpm build` | Compila o TypeScript para a pasta `dist/` |
| `pnpm migration:run` | Executa as migrations pendentes |
| `pnpm migration:show` | Lista as migrations e quais já foram executadas |
| `pnpm migration:revert` | Desfaz a última migration |
| `pnpm seed` | Carrega os dados iniciais (pode ser rodado mais de uma vez) |
| `pnpm test` | Roda os testes unitários (Vitest) |
| `pnpm lint` | Roda o oxlint |
| `pnpm format` | Formata o código com o Prettier |

## Organização

Cada módulo de `src/` segue a mesma estrutura:

| Arquivo | Responsabilidade |
|---|---|
| `*.controller.ts` | Recebe a requisição, aplica os guards e chama o service |
| `*.service.ts` | Regras de negócio e tradução dos erros de domínio em respostas HTTP |
| `*.repository.ts` | Único ponto de acesso ao banco: consultas, transações e tradução dos erros do PostgreSQL |
| `*.errors.ts` | Erros de domínio lançados pelo repository |
| `dto/*.dto.ts` | Validação dos dados de entrada |
| `*.entity.ts` | Mapeamento das tabelas (a estrutura real é criada pelas migrations, em SQL) |

As migrations ficam em `src/database/migrations` e as seeds em `src/database/seeds`. O `synchronize` do TypeORM está desligado: o banco só muda por migration.
