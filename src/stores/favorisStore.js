import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import router from '@/Router/Routes'

const API_BASE_URL = 'http://localhost:3000/api/favoris'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref([])
  const loading = ref(false)
  const authStore = useAuthStore()

  const favoritesCount = computed(() => favorites.value.length)

  const isFavorite = (productId) => {
    return favorites.value.some(fav => fav.product_id === productId)
  }

  const fetchFavorites = async () => {
    if (!authStore.user) return
    loading.value = true
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(API_BASE_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      favorites.value = Array.isArray(data) ? data : []
    } catch (err) {
      favorites.value = []
    } finally {
      loading.value = false
    }
  }

  const addFavorite = async (productId) => {
    // Vérifier si l'utilisateur est connecté
    if (!authStore.isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: '⚠️ Veuillez vous connecter pour ajouter un produit en favoris' }
      }))
      router.push('/Connexion')
      return
    }
    
    if (!authStore.user) return
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      })
      if (res.ok) await fetchFavorites()
    } catch (err) {}
  }

  const removeFavorite = async (productId) => {
    if (!authStore.user) return
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${API_BASE_URL}/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) await fetchFavorites()
    } catch (err) {}
  }

  const toggleFavorite = async (product) => {
    // Vérifier si l'utilisateur est connecté
    if (!authStore.isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: '⚠️ Veuillez vous connecter pour ajouter un produit en favoris' }
      }))
      router.push('/Connexion')
      return
    }
    
    if (isFavorite(product.id)) {
      await removeFavorite(product.id)
    } else {
      await addFavorite(product.id)
    }
  }

  return {
    favorites,
    favoritesCount,
    isFavorite,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loading
  }
})
