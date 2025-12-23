<template>
  <div class="products-section">
    <div class="section-header">
      <h2>Gestion des produits</h2>
      <button class="btn-primary" @click="$emit('edit-product', null)">
        <i class="fas fa-plus"></i> Ajouter un produit
      </button>
    </div>

    <div class="products-grid">
      <div class="product-admin-card" v-for="product in products" :key="product.id">
        <img :src="product.image" :alt="product.name">
        <div class="product-admin-info">
          <h4>{{ product.name }}</h4>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-stock">
            <span class="stock-badge" :class="getStockClass(product.stock)">
              Stock: {{ product.stock || 0 }}
            </span>
          </div>
          <div class="product-admin-footer">
            <strong>{{ product.price }} FCFA</strong>
            <div class="product-admin-actions">
              <button class="btn-action btn-edit" @click="$emit('edit-product', product)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-action btn-delete" @click="$emit('delete-product', product.id)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  products: {
    type: Array,
    required: true
  }
})

const getStockClass = (stock) => {
  if (stock === 0) return 'stock-out'
  if (stock < 10) return 'stock-low'
  return 'stock-ok'
}
</script>
