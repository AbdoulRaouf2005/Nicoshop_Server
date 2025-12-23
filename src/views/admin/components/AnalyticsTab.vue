<template>
  <div class="analytics-section">
    <h2>Statistiques et analytiques</h2>
    
    <div class="analytics-grid">
      <div class="analytics-card">
        <h3>Répartition des commandes</h3>
        <div class="chart-placeholder">
          <div class="pie-chart">
            <div class="pie-slice" style="background: #667eea;">
              <span>{{ stats.completedOrders }}</span>
            </div>
            <div class="pie-info">
              <p><span class="color-box" style="background: #667eea;"></span> Complétées: {{ stats.completedOrders }}</p>
              <p><span class="color-box" style="background: #ffa502;"></span> En attente: {{ stats.pendingOrders }}</p>
              <p><span class="color-box" style="background: #ff4757;"></span> Autres: {{ stats.totalOrders - stats.completedOrders - stats.pendingOrders }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-card">
        <h3>Performances</h3>
        <div class="performance-stats">
          <div class="perf-item">
            <span class="perf-label">Panier moyen</span>
            <span class="perf-value">{{ stats.averageOrderValue.toFixed(2) }} €</span>
          </div>
          <div class="perf-item">
            <span class="perf-label">Taux de conversion</span>
            <span class="perf-value">12.5%</span>
          </div>
          <div class="perf-item">
            <span class="perf-label">Clients actifs</span>
            <span class="perf-value">{{ stats.totalCustomers }}</span>
          </div>
        </div>
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
