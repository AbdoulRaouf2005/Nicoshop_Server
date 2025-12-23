<template>
  <div class="stats-grid">
    <div class="stat-card stat-revenue">
      <div class="stat-icon">
        <i class="fas fa-coins"></i>
      </div>
      <div class="stat-details">
        <h3>{{ stats.totalRevenue.toFixed(2) }} FCFA</h3>
        <p>Revenu total</p>
      </div>
    </div>

    <div class="stat-card stat-orders">
      <div class="stat-icon">
        <i class="fas fa-shopping-bag"></i>
      </div>
      <div class="stat-details">
        <h3>{{ stats.totalOrders }}</h3>
        <p>Commandes totales</p>
      </div>
    </div>

    <div class="stat-card stat-pending">
      <div class="stat-icon">
        <i class="fas fa-clock"></i>
      </div>
      <div class="stat-details">
        <h3>{{ stats.pendingOrders }}</h3>
        <p>En attente</p>
      </div>
    </div>

    <div class="stat-card stat-customers">
      <div class="stat-icon">
        <i class="fas fa-users"></i>
      </div>
      <div class="stat-details">
        <h3>{{ stats.totalCustomers }}</h3>
        <p>Clients</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>
