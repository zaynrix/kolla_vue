import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/actor',
      name: 'actor-dashboard',
      component: () => import('../views/ActorDashboardView.vue'),
      meta: { title: 'My Work Steps' },
    },
    {
      path: '/workflow-manager',
      name: 'workflow-manager-dashboard',
      component: () => import('../views/WorkflowManagerDashboardView.vue'),
      meta: { title: 'Workflow Manager Dashboard' },
    },
    {
      path: '/workflows',
      name: 'workflows',
      component: () => import('../views/WorkflowsView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/roles',
      name: 'role-management',
      component: () => import('../views/RoleManagementView.vue'),
      meta: { title: 'Role Management' },
    },
    {
      path: '/actors',
      name: 'actor-management',
      component: () => import('../views/ActorManagementView.vue'),
      meta: { title: 'Actor Management' },
    },
  ],
})

export default router
