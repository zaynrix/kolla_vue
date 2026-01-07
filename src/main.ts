import './assets/main.css'
import './assets/responsive.css'
import './assets/design-system.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { ApiServicesKey, defaultApiServices } from './composables/useApi'
import { useUserStore } from './stores/user'
import { useThemePrototype } from './composables/useThemePrototype'

const app = createApp(App)

// Initialize Pinia store
app.use(createPinia())

// Initialize Router
app.use(router)

// Provide API services via dependency injection at app level
// This can be overridden in tests or for different environments
app.provide(ApiServicesKey, defaultApiServices)

// Restore user from localStorage on app startup (before mounting)
// This ensures user is restored before router guard runs
async function restoreUser() {
  const userStore = useUserStore()
  try {
    const saved = localStorage.getItem('currentUser')
    if (saved) {
      const parsed = JSON.parse(saved)
      const actorGuid = parsed?.actorGuid || parsed?.id // Support both formats
      
      if (actorGuid) {
        // Restore user by finding actor using API services directly
        // (can't use composables here as they require Vue context)
        const { defaultApiServices } = await import('@/services/api')
        const { mapActorToUser } = await import('@/services/api/mappers')
        
        // Load all actors to find the one we need
        const actorGuids = await defaultApiServices.actor.getAllActors()
        const actors = await Promise.all(
          actorGuids.map((guid: string) => defaultApiServices.actor.getActor(guid))
        )
        
        const actor = actors.find(a => a.guid === actorGuid)
        if (actor) {
          const user = mapActorToUser(actor, actor.role)
          userStore.setCurrentUser(user)
          console.log('[App] User restored from localStorage:', user.username)
          return true // Restoration successful
        } else {
          console.warn('[App] Actor not found, clearing saved user')
          localStorage.removeItem('currentUser')
          return false
        }
      }
    }
    return false
  } catch (err) {
    console.error('[App] Failed to restore user:', err)
    localStorage.removeItem('currentUser')
    return false
  }
}

// Initialize theme prototype
if (typeof window !== 'undefined') {
  const { loadPrototype } = useThemePrototype()
  loadPrototype()
}

// Restore user before mounting app and starting router
// This ensures user is authenticated before router guard checks
// Use IIFE to handle async properly
;(async () => {
  const restored = await restoreUser()
  if (restored) {
    console.log('[App] User session restored successfully')
    
    // Start SignalR connection for real-time updates
    try {
      const { getSignalRService } = await import('@/services/signalr/signalrService')
      const signalRService = getSignalRService()
      await signalRService.start()
      console.log('[App] SignalR connection started')
    } catch (error) {
      console.error('[App] Failed to start SignalR connection:', error)
      // Don't block app startup if SignalR fails
    }
  }
  app.mount('#app')
})()
