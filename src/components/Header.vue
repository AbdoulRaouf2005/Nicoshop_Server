<template>
      <header class="header fixed-top">
            <nav class="navbar navbar-expand-lg navbar-light">
                  <div class="container">
                        <div class="d-flex justify-content-center align-items-center">
                              <h1 class="site-name text-center">NicoShop</h1>
                        </div>
                        <div class="search-bar mx-5 flex-grow-1" style="max-width: 500px;">
                              <div class="input-group">
                                    <input ref="MyInput" type="text" class="form-control"
                                          placeholder="Rechercher des produits..."
                                          @input="productStore.updateSearchQuery($event.target.value)"
                                          v-model="productStore.searchQuery">
                                    <button class="btn btn-outline-light" @click="inputFocus">
                                          <i class="fas fa-search"></i>
                                    </button>
                              </div>
                        </div>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                              data-bs-target="#navbarNav">
                              <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarNav">
                              <ul class="navbar-nav ms-auto d-flex justify-content-between nav-icons">
                                    <li class="nav-item">
                                          <router-link to="/" class="nav-icon" @click="clearSearch">
                                                <i class="fas fa-home fa-lg"></i>
                                                <span>Exploration</span>
                                          </router-link>
                                    </li>
                                    <li class="nav-item" v-if="authStore.isAuthenticated">
                                          <router-link to="/Favoris" class="nav-icon">
                                                <i class="far fa-heart fa-lg"></i>
                                                <span>Favoris</span>
                                                <span class="badge-count" v-if="favoritesStore.favoritesCount > 0">
                                                      {{ favoritesStore.favoritesCount }}
                                                </span>
                                          </router-link>
                                    </li>
                                    <li class="nav-item" v-if="authStore.isAuthenticated">
                                          <router-link to="/Profil" class="nav-icon">
                                                <i class="far fa-user fa-lg"></i>
                                                <span>Profil</span>
                                          </router-link>
                                    </li>
                                    <li class="nav-item" v-if="authStore.isAuthenticated">
                                          <router-link to="/Panier" class="nav-icon">
                                                <i class="fas fa-shopping-cart fa-lg"></i>
                                                <span>Panier</span>
                                                <span class="badge-count" v-if="cartStore.cartItemsCount > 0">
                                                      {{ cartStore.cartItemsCount }}
                                                </span>
                                          </router-link>
                                    </li>
                                    <li class="nav-item" v-if="!authStore.isAuthenticated">
                                          <router-link to="/Connexion" class="nav-icon">
                                                <i class="fas fa-sign-in-alt fa-lg"></i>
                                                <span>Connexion</span>
                                          </router-link>
                                    </li>
                              </ul>
                        </div>
                  </div>
            </nav>
      </header>

</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/produitStore'
import { useFavoritesStore } from '@/stores/favorisStore'
import { useCartStore } from '@/stores/cartStore'

const authStore = useAuthStore()
const productStore = useProductStore()
const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()
const MyInput = ref(null)


const clearSearch = () => {
      productStore.clearSearchQuery();
};

const inputFocus = () => {
      MyInput.value?.focus()
};
</script>

<style scoped>
.header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.5rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
}

.site-name {
      font-size: 2rem;
      font-weight: bold;
      margin: 0;
}

.search-bar {
      max-width: 500px;
      /* margin: 1rem auto; */
}

.search-bar input {
      border-radius: 25px;
      /* padding: 0.75rem 1.5rem; */
      border: none;
}

.search-bar button {
      border-top-right-radius: 25px;
      border-bottom-right-radius: 25px;
}

.nav-icons {
      display: flex;
      justify-content: center;
      gap: 4rem;
      margin-top: 1rem;
      flex-wrap: wrap;
}

.nav-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: white;
      text-decoration: none;
      transition: transform 0.3s;
      cursor: pointer;
      position: relative;
}

.nav-icon:hover {
      transform: translateY(-5px);
      color: white;
}

.nav-icon i {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
}

.nav-icon span {
      font-size: 0.85rem;
}

.nav-icon-admin {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  /* padding: 0.5rem 1rem !important; */
}

.nav-icon-admin i {
  color: #ffd700 !important;
}


.badge-count {
      position: absolute;
      top: -20px;
      right: -5px;
      background-color: #ff4757;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: bold;
}
</style>