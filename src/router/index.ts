import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Login', requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Home', requiresAuth: true },
    },
    {
      path: '/my-work-steps',
      name: 'actor-dashboard',
      component: () => import('../views/ActorDashboardView.vue'),
      meta: { title: 'My Work Steps', requiresAuth: true },
    },
    {
      path: '/workflow-manager',
      name: 'workflow-manager-dashboard',
      component: () => import('../views/WorkflowManagerDashboardView.vue'),
      meta: { title: 'Workflow Manager Dashboard', requiresAuth: true, requiresWorkflowManager: true },
    },
    {
      path: '/workflows',
      name: 'workflows',
      component: () => import('../views/WorkflowsView.vue'),
      meta: { title: 'Workflows', requiresAuth: true, requiresAdmin: false },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: 'About', requiresAuth: true },
    },
    {
      path: '/roles',
      name: 'role-management',
      component: () => import('../views/RoleManagementView.vue'),
      meta: { title: 'Role Management', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/users',
      name: 'actor-management',
      component: () => import('../views/ActorManagementView.vue'),
      meta: { title: 'User Management', requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/users/:id',
      name: 'actor-details',
      component: () => import('../views/ActorDetailsView.vue'),
      meta: { title: 'User Details', requiresAuth: true, requiresAdmin: false },
    },
  ],
})

// Route guard: check authentication and authorization
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // Always try to restore user from localStorage if not authenticated (e.g., on page reload)
  // This ensures users stay on the same page when reloading
  if (!userStore.isAuthenticated) {
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
            console.log('[Router] User restored from localStorage:', user.username)
            // User restored successfully - continue to the route they were trying to access
            // This allows them to stay on the same page after reload
            // Continue to next() below - user is now authenticated
          } else {
            console.warn('[Router] Actor not found, clearing saved user')
            localStorage.removeItem('currentUser')
            // Only redirect to login if restoration failed AND route requires auth
            if (to.meta.requiresAuth && to.path !== '/login') {
              next('/login')
              return
            }
            // If route doesn't require auth, allow navigation
            next()
            return
          }
        } else {
          // No actorGuid in saved data, clear it
          localStorage.removeItem('currentUser')
          if (to.meta.requiresAuth && to.path !== '/login') {
            next('/login')
            return
          }
          // If route doesn't require auth, allow navigation
          next()
          return
        }
      } else {
        // No saved user data - only redirect if route requires auth and not already going to login
        if (to.meta.requiresAuth && to.path !== '/login') {
          next('/login')
          return
        }
        // If route doesn't require auth, allow navigation
        next()
        return
      }
    } catch (err) {
      console.error('[Router] Failed to restore user:', err)
      localStorage.removeItem('currentUser')
      // Only redirect if route requires auth and not already going to login
      if (to.meta.requiresAuth && to.path !== '/login') {
        next('/login')
        return
      }
      // If route doesn't require auth, allow navigation
      next()
      return
    }
  }

  // Check if route requires authentication (after restoration attempt)
  // At this point, user should be authenticated if restoration succeeded
  if (to.meta.requiresAuth) {
    // Double-check authentication status after restoration
    if (!userStore.isAuthenticated) {
      // If still not authenticated, redirect to login
      // But only if not already going to login
      if (to.path !== '/login') {
        next('/login')
        return
      }
    }

    // Check if route requires admin
    if (to.meta.requiresAdmin && !userStore.isAdmin) {
      // Non-admin users redirected to their dashboard
      next('/my-work-steps')
      return
    }
    
    // Check if route requires workflow manager (admin or workflow manager)
    if (to.meta.requiresWorkflowManager && !userStore.isAdmin && !userStore.isWorkflowManager) {
      // Non-workflow-manager users redirected to their dashboard
      next('/my-work-steps')
      return
    }
    
    // For actor details route, non-admin can only access their own details
    if (to.name === 'actor-details' && !userStore.isAdmin) {
      const actorId = to.params.id as string
      if (actorId !== userStore.currentUser?.id) {
        // Non-admin trying to access another actor's details
        next('/my-work-steps')
        return
      }
    }
  }

  // If already authenticated and trying to access login, redirect to appropriate dashboard
  // This prevents authenticated users from seeing the login page (even on reload)
  // Users can only access login if they explicitly logout
  if (to.path === '/login' && userStore.isAuthenticated) {
    // Redirect authenticated users away from login page
    if (userStore.isAdmin) {
      next('/')
    } else {
      next('/my-work-steps')
    }
    return
  }

  // Allow navigation to proceed - user stays on same page on reload
  next()
})

export default router
