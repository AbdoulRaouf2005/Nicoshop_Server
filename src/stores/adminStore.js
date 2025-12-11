import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ordersAPI } from '@/services/api'
import { usersAPI } from '@/services/api'

export const useAdminStore = defineStore('admin', () => {
  const orders = ref([])
  const users = ref([])

  const stats = computed(() => {
    const totalRevenue = orders.value.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.value.length
    const pendingOrders = orders.value.filter(o => o.status === 'pending').length
    const completedOrders = orders.value.filter(o => o.status === 'completed').length
    const totalCustomers = users.value.filter(u => u.role === 'customer').length

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    }
  })

  const isAdmin = (email) => {
    // Vérifier via le rôle de l'utilisateur actuel
    return false
  }

  // Charger les commandes depuis l'API
  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll()

      // Normaliser le format des items retournés par l'API
      orders.value = (Array.isArray(data) ? data : []).map(order => ({
        id: order.id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        total: parseFloat(order.total) || 0,
        status: order.status || 'pending',
        date: order.created_at || new Date().toISOString(),
        items: Array.isArray(order.items)
          ? order.items.map(it => ({
              id: it.product_id ?? it.id,
              name: it.product_name ?? it.name ?? it.title ?? 'Produit',
              quantity: it.quantity ?? 1,
              price: parseFloat(it.price) || 0
            }))
          : []
      }))

      console.log('✅ Commandes chargées:', orders.value.length)
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
      orders.value = []
    }
  }

  // Charger les utilisateurs depuis l'API (fallback aux mocks si erreur)
  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll()
      if (!Array.isArray(data)) throw new Error('Format utilisateurs invalide')

      users.value = data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'customer',
        joined: u.joined || u.created_at || new Date().toISOString(),
        totalOrders: u.totalOrders || 0,
        totalSpent: parseFloat(u.totalSpent) || 0,
        status: u.status || 'active'
      }))
      console.log('✅ Utilisateurs chargés:', users.value.length)
    } catch (err) {
      console.error('Impossible de charger les utilisateurs depuis l\'API:', err)
      users.value = []
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.status = newStatus
      }
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return false
    }
  }

  const deleteOrder = async (orderId) => {
    try {
      await ordersAPI.delete(orderId)
      
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index > -1) {
        orders.value.splice(index, 1)
      }
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error)
      return false
    }
  }

  const updateUserStatus = async (userId, newStatus) => {
    try {
      await usersAPI.updateStatus(userId, newStatus)
      
      const user = users.value.find(u => u.id === userId)
      if (user) {
        user.status = newStatus
      }
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      return false
    }
  }

  const deleteUser = async (userId) => {
    try {
      await usersAPI.delete(userId)
      
      const index = users.value.findIndex(u => u.id === userId)
      if (index > -1) {
        users.value.splice(index, 1)
      }
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      return false
    }
  }

  return {
    orders,
    users,
    stats,
    isAdmin,
    fetchOrders,
    fetchUsers,
    updateOrderStatus,
    deleteOrder,
    updateUserStatus,
    deleteUser
  }
})