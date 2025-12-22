import './assets/main.css'
import './assets/responsive.css'
import './assets/design-system.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { provideApi, defaultApiServices } from './composables/useApi'

const app = createApp(App)

// Initialize Pinia store
app.use(createPinia())

// Initialize Router
app.use(router)

// Provide API services via dependency injection
// This can be overridden in tests or for different environments
provideApi(defaultApiServices)

app.mount('#app')
