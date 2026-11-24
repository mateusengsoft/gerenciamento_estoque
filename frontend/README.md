# Frontend: telas do Gerenciamento de Estoque

Interface em **Vue 3** com **Options API**, **Vue Router**, **Pinia** e **Vite**.

> O passo a passo completo para rodar o projeto (banco, backend e frontend), as telas e as decisões estão no [README principal](../README.md).

## Como rodar

O backend precisa estar rodando antes.

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
pnpm install
pnpm dev               # abre em http://localhost:5173
```

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | Sobe o frontend em modo de desenvolvimento |
| `pnpm build` | Checa os tipos (vue-tsc) e gera a versão de produção em `dist/` |
| `pnpm preview` | Serve localmente a versão gerada pelo `build` |
| `pnpm lint` | Roda o oxlint e o ESLint |
| `pnpm format` | Formata o código com o Prettier |

## Organização

| Pasta | Conteúdo |
|---|---|
| `src/views` | Uma tela por arquivo |
| `src/components` | Barra de navegação, paginação e campo de moeda |
| `src/router` | Rotas e o navigation guard (login obrigatório e rotas só de administrador) |
| `src/stores` | Store do Pinia com o token e o perfil do usuário |
| `src/services` | Cliente da API: monta as requisições e transforma os erros em mensagens |
| `src/types` | Tipos das respostas da API |
| `src/utils` | Formatação de preço, quantidade e data |
| `src/assets` | CSS global |

## Editor recomendado

VS Code com a extensão **Vue - Official**. Desative a extensão Vetur, que é do Vue 2 e acusa erros falsos nos arquivos `.vue`.
