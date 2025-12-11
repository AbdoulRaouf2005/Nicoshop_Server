<template>
      <div>
            <div class="row justify-content-center">
                  <div class="col-lg-8">
                        <div class="card">
                              <div class="card-body text-center p-5">
                                    <i class="fas fa-user-circle" style="font-size: 5rem; color: #667eea;"></i>
                                    <div v-if="authStore.user" class="row mt-4 text-start">
                                          <div class="col-12 mb-3">
                                                <label class="form-label fw-bold">Nom complet</label>
                                                <p class="form-control-plaintext">{{ authStore.user.name }}</p>
                                          </div>

                                          <div class="col-md-6 mb-3">
                                                <label class="form-label fw-bold">Email</label>
                                                <p class="form-control-plaintext">{{ authStore.user.email }}</p>
                                          </div>

                                          <div class="col-md-6 mb-3">
                                                <label class="form-label fw-bold">Membre depuis</label>
                                                <p class="form-control-plaintext">{{ formatDate(authStore.user.created_at || authStore.user.joined || new Date().toISOString()) }}</p>
                                          </div>

                                          <div class="col-12 mt-4">
                                                <h4>Mes commandes</h4>
                                                <div v-if="orders.length === 0" class="text-muted">Aucune commande trouvée</div>
                                                <div v-else class="orders-list">
                                                      <div class="order-card" v-for="order in orders" :key="order.id">
                                                            <div class="order-header d-flex justify-content-between">
                                                                  <div>
                                                                        <strong>{{ order.id }}</strong>
                                                                        <div class="text-muted">{{ formatDate(order.date) }}</div>
                                                                  </div>
                                                                  <div class="text-end">
                                                                        <div><strong>{{ order.total.toFixed(2) }} €</strong></div>
                                                                        <div class="badge status" :class="'status-' + order.status">{{ getStatusLabel(order.status) }}</div>
                                                                  </div>
                                                            </div>
                                                            <div class="order-items mt-2">
                                                                  <small class="text-muted">Articles:</small>
                                                                  <ul>
                                                                        <li v-for="(it, i) in order.items" :key="i">{{ it.name }} x{{ it.quantity }} — {{ it.price.toFixed(2) }} €</li>
                                                                  </ul>
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                                    <div class="mt-4 d-flex align-items-center justify-content-center flex-column">
                                          <div class="form-check form-switch mb-3">
                                                <input class="form-check-input" type="checkbox" id="darkSwitch" :checked="authStore.theme === 'dark'" @change="authStore.toggleTheme()">
                                                <label class="form-check-label" for="darkSwitch">Mode sombre</label>
                                          </div>
                                          <button @click="handleLogout" class="btn btn-outline-danger">
                                                <i class="fas fa-sign-out-alt me-2"></i>
                                                Se déconnecter
                                          </button>
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ordersAPI } from '@/services/api'
import { useFavoritesStore } from '@/stores/favorisStore'

const router = useRouter()
const authStore = useAuthStore()
const orders = ref([])
const favoritesStore = useFavoritesStore()

const handleLogout = () => {
                  authStore.logout()
                  router.push('/')
}

const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const getStatusLabel = (status) => {
      const labels = {
            pending: 'En attente',
            completed: 'Complétée',
            shipped: 'Expédiée',
            cancelled: 'Annulée'
      }
      return labels[status] || status
}

onMounted(async () => {
      try {
            if (authStore.user && authStore.user.id) {
                  const data = await ordersAPI.getUserOrders(authStore.user.id)
                  orders.value = Array.isArray(data) ? data.map(o => ({
                        id: o.id,
                        total: parseFloat(o.total) || 0,
                        status: o.status || 'pending',
                        date: o.created_at || o.date || new Date().toISOString(),
                        items: Array.isArray(o.items) ? o.items : []
                  })) : []
                  await favoritesStore.fetchFavorites()
            }
      } catch (err) {
            console.error('Erreur chargement commandes utilisateur:', err)
            orders.value = []
      }
})
</script>
<style scoped></style>