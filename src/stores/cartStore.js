import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ordersAPI } from '@/services/api'
import { useAuthStore } from './authStore'

export const useCartStore = defineStore('cart', () => {
  const cart = ref([])

  const cartItemsCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const addToCart = (product) => {
    const existingItem = cart.value.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      cart.value.push({ ...product, quantity: 1 })
    }
    
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: '✓ Produit ajouté au panier !' }
    }))
  }

  const removeFromCart = (item) => {
    const index = cart.value.indexOf(item)
    if (index > -1) {
      cart.value.splice(index, 1)
    }
  }

  const increaseQuantity = (item) => {
    item.quantity++
  }

  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      item.quantity--
    } else {
      removeFromCart(item)
    }
  }

  const checkout = async (paymentMethod = 'card', shippingAddress = null) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: '❌ Vous devez être connecté pour passer commande' }
      }))
      return false
    }

    if (cart.value.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: '❌ Votre panier est vide' }
      }))
      return false
    }

    try {
      const orderData = {
        items: cart.value.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: cartTotal.value,
        payment_method: paymentMethod,
        shipping_address: shippingAddress
      }

      await ordersAPI.create(orderData)
      
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: '🎉 Commande passée avec succès !' }
      }))
      
      cart.value = []
      return true
    } catch (error) {
      console.error('Erreur lors de la commande:', error)
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `❌ Erreur: ${error.message}` }
      }))
      return false
    }
  }

  return {
    cart,
    cartItemsCount,
    cartTotal,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    checkout
  }
})