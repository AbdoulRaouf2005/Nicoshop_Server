import Accueil from "@/pages/Accueil.vue";
import Connexion from "@/pages/Connexion.vue";
import Favoris from "@/pages/Favoris.vue";
import Inscription from "@/pages/Inscription.vue";
import Panier from "@/pages/Panier.vue";
import Profil from "@/pages/Profil.vue";
import { useAuthStore } from "@/stores/authStore";
import { createRouter, createWebHistory } from "vue-router";
import AdminDashboard from '@/views/admin/AdminDashboard.vue'


const router = createRouter({
      history: createWebHistory(),
      routes: [
            { path: '/', component: Accueil },
            { path: '/Panier', component: Panier, meta: { requiresAuth: true } },
            { path: '/Profil', component: Profil, meta: { requiresAuth: true } },
            { path: '/Favoris', component: Favoris, meta: { requiresAuth: true } },
            { path: '/Connexion', component: Connexion, meta: { requiresAuth: false } },
            { path: '/Inscription', component: Inscription, meta: { requiresAuth: false } },
            { path: '/Admin', component:AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true}}
      ]
})

// Navigation Guard - Protège les routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Vérifier l'authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: '⚠️ Veuillez vous connecter pour accéder à cette page' }
    }))
    next('/Connexion')
    return
  }
  
  // Vérifier le rôle admin si requis
  if (to.meta.requiresAdmin) {
    const role = authStore.user?.role || null
    if (role !== 'admin') {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: '⚠️ Accès réservé aux administrateurs' }
      }))
      next('/')
      return
    }
  }
  
  next()
})
export default router;