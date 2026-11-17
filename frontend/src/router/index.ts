import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/produtos' },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/produtos', name: 'produtos', component: () => import('@/views/ProdutosView.vue') },
  ],
})

export default router
