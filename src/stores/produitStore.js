import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsAPI } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const searchQuery = ref('')
  const isLoading = ref(false)
  const error = ref(null)

  const filteredProducts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    
    if (!query) {
      return products.value
    }
    
    return products.value.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(query)
      const descMatch = product.description.toLowerCase().includes(query)
      return nameMatch || descMatch
    })
  })

  const updateSearchQuery = (query) => {
    searchQuery.value = query
  }

  // Charger tous les produits depuis l'API
  const fetchProducts = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await productsAPI.getAll()
      if (!Array.isArray(data)) {
        throw new Error('Format de réponse invalide')
      }
      products.value = data.map(product => ({
        id: product.id,
        name: product.name || 'Produit sans nom',
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        image: product.image_url || 'https://via.placeholder.com/300',
        stock: parseInt(product.stock) || 0,
        category: product.category || 'Général',
        status: product.status || 'active'
      }))
      console.log('✅ Produits chargés:', products.value.length)
    } catch (err) {
      error.value = err.message
      console.error('Erreur lors du chargement des produits:', err)
      products.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Ajouter un produit (admin)
  const addProduct = async (productData) => {
    try {
      // Empêcher un utilisateur avec le rôle 'admin' d'ajouter un produit (contrainte demandée)
      const auth = useAuthStore()
      if (auth.user && auth.user.role === 'admin') {
        throw new Error('Les administrateurs ne peuvent pas ajouter de produits depuis cette interface')
      }

      if (!productData.name || !productData.price) {
        throw new Error('Nom et prix sont obligatoires')
      }

      const newProduct = await productsAPI.create({
        name: productData.name,
        description: productData.description || '',
        price: parseFloat(productData.price),
        image_url: productData.image || 'https://via.placeholder.com/300',
        stock: parseInt(productData.stock) || 0,
        category: productData.category || 'Général'
      })

      products.value.push({
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        image: newProduct.image_url,
        stock: newProduct.stock,
        category: newProduct.category,
        status: newProduct.status || 'active'
      })

      return true
    } catch (err) {
      console.error('Erreur lors de l\'ajout du produit:', err)
      throw err
    }
  }

  // Mettre à jour un produit (admin)
  const updateProduct = async (productId, productData) => {
    try {
      const updatePayload = {}
      if (productData.name) updatePayload.name = productData.name
      if (productData.description !== undefined) updatePayload.description = productData.description
      if (productData.price !== undefined) updatePayload.price = parseFloat(productData.price)
      if (productData.image) updatePayload.image_url = productData.image
      if (productData.stock !== undefined) updatePayload.stock = parseInt(productData.stock)
      if (productData.category) updatePayload.category = productData.category

      const updatedProduct = await productsAPI.update(productId, updatePayload)

      const index = products.value.findIndex(p => p.id === productId)
      if (index > -1) {
        products.value[index] = {
          id: updatedProduct.id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: parseFloat(updatedProduct.price),
          image: updatedProduct.image_url,
          stock: updatedProduct.stock,
          category: updatedProduct.category,
          status: updatedProduct.status || 'active'
        }
      }

      return true
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err)
      throw err
    }
  }

  // Supprimer un produit (admin)
  const deleteProduct = async (productId) => {
    try {
      await productsAPI.delete(productId)
      
      const index = products.value.findIndex(p => p.id === productId)
      if (index > -1) {
        products.value.splice(index, 1)
      }

      return true
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err)
      throw err
    }
  }

  return {
    products,
    searchQuery,
    isLoading,
    error,
    filteredProducts,
    updateSearchQuery,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  }
})
