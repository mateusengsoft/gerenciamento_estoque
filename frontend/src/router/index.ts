import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    publica?: boolean
    somenteAdmin?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/produtos' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { publica: true },
    },
    { path: '/produtos', name: 'produtos', component: () => import('@/views/ProdutosView.vue') },

    { path: '/entradas', name: 'entradas', component: () => import('@/views/EntradaView.vue') },

    { path: '/saidas', name: 'saidas', component: () => import('@/views/SaidaView.vue') },

    {
      path: '/movimentacoes',
      name: 'movimentacoes',
      component: () => import('@/views/HistoricoView.vue'),
    },

    { path: '/estoque', name: 'estoque', component: () => import('@/views/EstoqueView.vue') },

    {
      path: '/estoque/:produtoId',
      name: 'estoque-detalhe',
      component: () => import('@/views/EstoqueDetalheView.vue'),
    },

    {
      path: '/produtos/novo',
      name: 'produto-novo',
      component: () => import('@/views/ProdutoNovoView.vue'),
      meta: { somenteAdmin: true },
    },

    {
  path: '/produtos/:id/editar',
  name: 'produto-editar',
  component: () => import('@/views/ProdutoEditarView.vue'),
  meta: { somenteAdmin: true },
},

    { path: '/:caminho(.*)*', redirect: '/produtos' },
  ],
})

router.beforeEach((destino) => {
  const auth = useAuthStore()

  if (!destino.meta.publica && !auth.estaLogado) {
    auth.sair()
    return { name: 'login' }
  }

  if (destino.meta.somenteAdmin && !auth.ehAdmin) {
    return { name: 'produtos' }
  }

  if (destino.name === 'login' && auth.estaLogado) {
    return { name: 'produtos' }
  }
})

export default router
