import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    publica?: boolean
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

    { path: '/:caminho(.*)*', redirect: '/produtos' },

    { path: '/saidas', name: 'saidas', component: () => import('@/views/SaidaView.vue') },
    {path: '/movimentacoes', name: 'movimentacoes', component: () => import('@/views/HistoricoView.vue')}
  ],
})

router.beforeEach((destino) => {
  const auth = useAuthStore()

  if (!destino.meta.publica && !auth.estaLogado) {
    auth.sair()
    return { name: 'login' }
  }

  if (destino.name === 'login' && auth.estaLogado) {
    return { name: 'produtos' }
  }
})

export default router
