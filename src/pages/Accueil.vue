<template>
  <div>
    <div class="banner">
      <h2>🎉 Offres Spéciales du Moment !</h2>
      <p>Jusqu'à -50% sur une sélection de produits</p>
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="produitStore.isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Chargement des produits...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="produitStore.error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Erreur de chargement</h3>
      <p>{{ produitStore.error }}</p>
      <button class="btn btn-primary" @click="produitStore.fetchProducts()">
        Réessayer
      </button>
    </div>

    <!-- Produits -->
    <div v-else-if="produitStore.filteredProducts.length > 0" class="row g-4">
                  <div 
                        class="col-12 col-sm-6 col-md-4 col-lg-3 product-card-wrapper" 
        v-for="product in produitStore.filteredProducts" 
        :key="product.id">
        <CarteProduit :product="product" />
      </div>
    </div>

    <!-- Aucun produit trouvé -->
    <div v-else class="empty-state">
      <i class="fas fa-search"></i>
      <h3>Aucun produit trouvé</h3>
      <p>Essayez une autre recherche</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue'
import { useProductStore } from '@/stores/produitStore'
import CarteProduit from '@/components/CarteProduit.vue'


const produitStore = useProductStore()

// Charger les produits au montage
onMounted(async () => {
  await produitStore.fetchProducts()
  
  // Appliquer l'animation après chargement
  nextTick(() => {
    const cards = document.querySelectorAll('.product-card-wrapper')
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('visible')
      }, index * 50)
    })
  })
})

// Observer les changements dans les produits filtrés pour réappliquer l'animation
watch(() => produitStore.filteredProducts, () => {
  nextTick(() => {
    const cards = document.querySelectorAll('.product-card-wrapper')
    cards.forEach((card, index) => {
      card.classList.remove('visible')
      setTimeout(() => {
        card.classList.add('visible')
      }, index * 50)
    })
  })
})
</script>
<style scoped>
/* Banner Styles */
.banner {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 4rem 2rem;
      text-align: center;
      margin-bottom: 2rem;
      border-radius: 10px;
}

.banner h2 {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
}

.banner p {
      font-size: 1.2rem;
}

/* Product Card Styles */
.product-card {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      height: 100%;
      display: flex;
      flex-direction: column;
}

.product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.product-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
}

.product-content {
      padding: 1.5rem;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
}

.product-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #333;
}

.product-description {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      flex-grow: 1;
}

.product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
}

.product-price {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
}

.product-actions {
      display: flex;
      gap: 0.5rem;
}

.btn-favorite {
      background: none;
      border: 2px solid #ff4757;
      color: #ff4757;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
}

.btn-favorite:hover,
.btn-favorite.active {
      background-color: #ff4757;
      color: white;
}

.btn-cart {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 25px;
      cursor: pointer;
      transition: transform 0.3s;
}

.btn-cart:hover {
      transform: scale(1.05);
}

.page-title {
      text-align: center;
      margin: 2rem 0;
      color: #333;
}

.empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
}

.empty-state i {
      font-size: 5rem;
      margin-bottom: 1rem;
      color: #ddd;
}

/* Animation scroll pour les cartes */
.product-card-wrapper {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
}

.product-card-wrapper.visible {
      opacity: 1;
      transform: translateY(0);
}

/* Délais d'animation en cascade */
.product-card-wrapper:nth-child(1) {
      transition-delay: 0.1s;
}

.product-card-wrapper:nth-child(2) {
      transition-delay: 0.2s;
}

.product-card-wrapper:nth-child(3) {
      transition-delay: 0.3s;
}

.product-card-wrapper:nth-child(4) {
      transition-delay: 0.4s;
}

.product-card-wrapper:nth-child(5) {
      transition-delay: 0.5s;
}

.product-card-wrapper:nth-child(6) {
      transition-delay: 0.6s;
}

.product-card-wrapper:nth-child(7) {
      transition-delay: 0.7s;
}

.product-card-wrapper:nth-child(8) {
      transition-delay: 0.8s;
}

.product-card-wrapper:nth-child(9) {
      transition-delay: 0.9s;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.loading-state i {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.error-state i {
  font-size: 3rem;
  color: #ff4757;
  margin-bottom: 1rem;
}

.error-state h3 {
  margin-bottom: 0.5rem;
}

.error-state p {
  margin-bottom: 1.5rem;
}
</style>
