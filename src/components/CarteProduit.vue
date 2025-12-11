<template>
      <div class="product-card">
            <img :src="product.image" :alt="product.name" class="product-image">
            <div class="product-content">
                  <h3 class="product-title">{{ product.name }}</h3>
                  <p class="product-description">{{ product.description }}</p>
                  <div class="product-footer">
                        <div class="product-actions">
                              <div class="row">
                                    <div class="col-8">
                                          <span class="product-price">{{ product.price }} €</span>
                                    </div>
                                    <div class="col-4">
                                          <button class="btn-favorite"
                                                :class="{ active: favoritesStore.isFavorite(product.id) }"
                                                @click="handleToggleFavorite"
                                                :disabled="favoritesStore.loading">
                                                <i class="fas fa-heart"></i>
                                          </button>
                                    </div>
                                    <div class="col-12 mt-2">
                                          <button class="btn-cart w-100" @click="addToCart">
                                                <i class="fas fa-cart-plus"></i>
                                                Ajouter
                                          </button>
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      </div>
</template>

<script setup>
import { useFavoritesStore } from '@/stores/favorisStore'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
      product: Object
})

const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const addToCart = () => {
      cartStore.addToCart(props.product)
}

const handleToggleFavorite = async () => {
      // Empêcher les admins de liker un produit
      if (authStore.user && authStore.user.role === 'admin') {
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '❌ Les administrateurs ne peuvent pas ajouter de favoris' } }))
            return
      }
      await favoritesStore.toggleFavorite(props.product)
}
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
      font-size: 1rem;
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
</style>