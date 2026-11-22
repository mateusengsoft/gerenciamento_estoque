import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.ts'
import { definirAoSessaoExpirar } from './services/api.ts'

const app = createApp(App)

app.use(createPinia())
const auth = useAuthStore()
definirAoSessaoExpirar(() => {
  auth.sair()
  void router.push({ name: 'login' })
})
app.use(router)

app.mount('#app')
