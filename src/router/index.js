import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'

import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  // The PWA serves index.html for every path, so without this a typo or a
  // stale bookmark renders an empty router-view and looks like a broken app.
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const isLoggedIn = !!auth.user

  if (to.meta.requiresAuth && !isLoggedIn) {
    return '/login'
  }

  if (to.meta.guestOnly && isLoggedIn) {
    return '/'
  }
})

export default router
