import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    // sscroll to top
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
      // No auth required - everyone can see the home page
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/items',
      name: 'Items',
      component: () => import('../views/ItemsView.vue'),
      // No auth required - everyone can browse items
    },
    {
      path: '/items/:id',
      name: 'ItemDetail',
      component: () => import('../views/ItemDetailView.vue'),
      // No auth required - everyone can view item details
    },
    {
      path: '/items/new',
      name: 'NewItem',
      component: () => import('../views/NewItemView.vue'),
      meta: { requiresAuth: true }, // Only authenticated users can post items
    },
    {
      path: '/activity',
      name: 'Activity',
      component: () => import('../views/ActivityView.vue'),
      meta: { requiresAuth: true },
    },
    // Redirect old routes to new unified Activity page
    {
      path: '/requests/incoming',
      redirect: '/activity',
    },
    {
      path: '/requests/my-requests',
      redirect: '/activity',
    },
    {
      path: '/transactions',
      redirect: '/activity',
    },
  ],
})

// Navigation guard to check authentication
router.beforeEach((to: RouteLocationNormalized, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Only protect routes that explicitly require auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresGuest && isAuthenticated) {
    // If logged in and trying to access login/register, redirect to home
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router

