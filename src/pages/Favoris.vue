<template>
      <div>
            <div v-if="favoritesStore.favorites.length === 0" class="empty-state">
                  <i class="fas fa-heart-broken fa-3x Big"></i>
                  <h3>Aucun favori</h3>
                  <p>Ajoutez des produits à vos favoris pour les retrouver ici</p>
                  <RouterLink to="/" class="btn btn-primary">
                        <i class="fas fa-shopping-bag me-2"></i>
                        Découvrir les produits
                  </RouterLink>
            </div>
            <div v-else class="row g-4">
                  <div class="col-6 col-md-4 col-lg-3 product-card-wrapper" v-for="product in favoritesStore.favorites"
                        :key="product.id" :ref="el => { if (el) productRefs.push(el) }">
                        <ProductCard :product="product" />
                  </div>
            </div>
      </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ref, onMounted, onBeforeUpdate } from 'vue'
import { useFavoritesStore } from '@/stores/favorisStore'
import ProductCard from '@/components/CarteProduit.vue'

const favoritesStore = useFavoritesStore()
const productRefs = ref([])

onMounted(() => {
      const observer = new IntersectionObserver(
            (entries) => {
                  entries.forEach(entry => {
                        if (entry.isIntersecting) {
                              entry.target.classList.add('visible')
                        }
                  })
            },
            { threshold: 0.1 }
      )

      productRefs.value.forEach(el => {
            if (el) observer.observe(el)
      })
})

onBeforeUpdate(() => {
      productRefs.value = []
})
</script>

<style scoped>
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

/* Cart & Favorites Page */
.empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
}

.empty-state .Big {
      font-size: 5rem;
      margin-bottom: 1rem;
      color: #ddd;
}

.cart-item {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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

@media (max-width: 768px) {
      .site-name {
            font-size: 1.5rem;
      }

      .nav-icons {
            gap: 1rem;
      }

      .banner h2 {
            font-size: 1.8rem;
      }
}
</style>