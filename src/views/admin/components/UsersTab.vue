<template>
  <div class="users-section">
    <div class="section-header">
      <h2>Gestion des utilisateurs</h2>
      <input 
        type="text" 
        class="search-input" 
        placeholder="Rechercher un utilisateur..."
        v-model="searchUserQuery">
    </div>

    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Inscrit le</th>
            <th>Commandes</th>
            <th>Total dépensé</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td><strong>{{ user.name }}</strong></td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="'badge-' + user.role">{{ user.role === 'admin' ? 'Admin' : 'Client' }}</span>
            </td>
            <td>{{ formatDate(user.joined) }}</td>
            <td>{{ user.totalOrders }}</td>
            <td><strong>{{ user.totalSpent.toFixed(2) }} €</strong></td>
            <td>
              <select 
                class="status-select"
                :class="'status-' + user.status"
                v-model="user.status"
                @change="$emit('update-status', user.id, user.status)">
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="banned">Banni</option>
              </select>
            </td>
            <td>
              <button 
                class="btn-action btn-delete" 
                @click="$emit('delete-user', user.id)"
                :disabled="user.role === 'admin'">
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
  users: {
    type: Array,
    required: true
  }
})

const searchUserQuery = ref('')

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const filteredUsers = computed(() => {
  if (!searchUserQuery.value) return props.users
  const query = searchUserQuery.value.toLowerCase()
  return props.users.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})
</script>
