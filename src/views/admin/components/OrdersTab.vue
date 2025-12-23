<template>
  <div class="orders-section">
    <div class="section-header">
      <h2>Gestion des commandes</h2>
      <input 
        type="text" 
        class="search-input" 
        placeholder="Rechercher une commande..."
        v-model="searchQuery">
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Date</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td><strong>{{ order.id }}</strong></td>
            <td>
              <div>{{ order.customerName }}</div>
              <small class="text-muted">{{ order.customerEmail }}</small>
            </td>
            <td>{{ formatDate(order.date) }}</td>
            <td><strong>{{ order.total.toFixed(2) }} FCFA</strong></td>
            <td>
              <select 
                class="status-select"
                :class="'status-' + order.status"
                v-model="order.status"
                @change="$emit('update-status', order.id, order.status)">
                <option value="pending">En attente</option>
                <option value="completed">Complétée</option>
                <option value="shipped">Expédiée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </td>
            <td>
              <button class="btn-action btn-view" @click="$emit('view-order', order)">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn-action btn-delete" @click="$emit('delete-order', order.id)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  orders: {
    type: Array,
    required: true
  }
})

const searchQuery = ref('')

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const filteredOrders = computed(() => {
  if (!searchQuery.value) return props.orders
  const query = searchQuery.value.toLowerCase()
  return props.orders.filter(order =>
    order.id.toLowerCase().includes(query) ||
    order.customerName.toLowerCase().includes(query) ||
    order.customerEmail.toLowerCase().includes(query)
  )
})
</script>
