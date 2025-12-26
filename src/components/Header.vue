<template>
      <header class="header fixed-top">
            <nav class="navbar navbar-expand-lg navbar-light">
                  <div class="container">
                        <div class="header-top" :class="{ 'hidden': isSearchExpanded }">
                              <div class="d-flex justify-content-center align-items-center">
                                    <h1 class="site-name text-center">NicoShop</h1>
                              </div>
                              <div class="mobile-actions">
                                    <button class="search-toggle-btn" @click="toggleSearch" aria-label="Toggle search">
                                          <i class="fas fa-search"></i>
                                    </button>
                                    <button class="navbar-toggler" type="button" @click="toggleMenu" :aria-expanded="false" aria-label="Toggle navigation" ref="navbarToggler">
                                          <span class="navbar-toggler-icon"></span>
                                    </button>
                              </div>
                        </div>

                        <div class="search-bar flex-grow-1 w-100" :class="{ 'search-expanded': isSearchExpanded }">
                              <div class="input-group">
                                    <input ref="MyInput" type="text" class="form-control"
                                          placeholder="Rechercher des produits..."
                                          @input="productStore.updateSearchQuery($event.target.value)"
                                          v-model="productStore.searchQuery">
                                    <button class="btn btn-outline-light search-btn" @click="inputFocus">
                                          <i class="fas fa-search"></i>
                                    </button>
                                    <button class="btn btn-outline-light close-search-btn" @click="toggleSearch">
                                          <i class="fas fa-times"></i>
                                    </button>
                              </div>
                        </div>

                        <div class="collapse navbar-collapse" id="navbarNav" ref="navbarNav">
                              <ul class="navbar-nav ms-auto d-flex justify-content-between nav-icons">
                                    <li class="nav-item">
                                          <router-link to="/" class="nav-icon" @click="() => { clearSearch(); handleNavAction(); }">
                                                <i class="fas fa-home fa-lg"></i>
                                                <span>Exploration</span>
                                          </router-link>
                                    </li>
                                    <li class="nav-item" v-if="authStore.isAuthenticated">
                                          <router-link to="/Favoris" class="nav-icon" @click="handleNavAction">
                                                <i class="far fa-heart fa-lg"></i>
                                                <span>Favoris</span>
                                                <span class="badge-count" v-if="favoritesStore.favoritesCount > 0">
                                                      {{ favoritesStore.favoritesCount }}
                                                </span>
                                          </router-link>
                                    </li>
                                    <li class="nav-item" v-if="authStore.isAuthenticated">
                                          <router-link to="/Profil" class="nav-icon" @click="handleNavAction">
                                                <i class="far fa-user fa-lg"></i>
                                                <span>Profil</span>
                                          </router-link>
                                    </li>
                                    <li class="nav-item" v-if="authStore.isAuthenticated">
                                          <router-link to="/Panier" class="nav-icon" @click="handleNavAction">
                                                <i class="fas fa-shopping-cart fa-lg"></i>
                                                <span>Panier</span>
                                                <span class="badge-count" v-if="cartStore.cartItemsCount > 0">
                                                      {{ cartStore.cartItemsCount }}
                                                </span>
                                          </router-link>
                                    </li>
                                    <li class="nav-item" v-if="!authStore.isAuthenticated">
                                          <router-link to="/Connexion" class="nav-icon" @click="handleNavAction">
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/produitStore'
import { useFavoritesStore } from '@/stores/favorisStore'
import { useCartStore } from '@/stores/cartStore'

const authStore = useAuthStore()
const productStore = useProductStore()
const favoritesStore = useFavoritesStore()
const cartStore = useCartStore()
const MyInput = ref(null)
const navbarNav = ref(null)
const navbarToggler = ref(null)
const isSearchExpanded = ref(false)

const toggleSearch = () => {
      isSearchExpanded.value = !isSearchExpanded.value
      if (isSearchExpanded.value) {
            setTimeout(() => {
                  MyInput.value?.focus()
            }, 300)
      }
};

const clearSearch = () => {
      productStore.clearSearchQuery();
};

const inputFocus = () => {
      MyInput.value?.focus()
};

const closeMenu = () => {
      if (navbarNav.value?.classList.contains('show')) {
            navbarNav.value.classList.remove('show')
      }
      if (navbarToggler.value) {
            navbarToggler.value.classList.add('collapsed')
            navbarToggler.value.setAttribute('aria-expanded', 'false')
      }
};

const toggleMenu = () => {
      const isOpen = navbarNav.value?.classList.toggle('show')
      if (navbarToggler.value) {
            navbarToggler.value.classList.toggle('collapsed', !isOpen)
            navbarToggler.value.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
      }
};

const handleNavAction = () => {
      closeMenu()
};

onMounted(() => {
      window.addEventListener('scroll', closeMenu)
})

onBeforeUnmount(() => {
      window.removeEventListener('scroll', closeMenu)
})
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
      width: 100%;
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

.mobile-actions {
      display: none;
}

.search-toggle-btn,
.close-search-btn {
      display: none;
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

.header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 1rem;
}

.navbar .container {
      display: flex;
      align-items: center;
      gap: 1rem;
}

.navbar-collapse {
      display: block !important;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transform: translateY(-8px);
      transition: max-height 0.3s ease, opacity 0.25s ease, transform 0.25s ease;
}

.navbar-collapse.show {
      max-height: 600px;
      opacity: 1;
      transform: translateY(0);
}


@media (max-width: 768px) {
  .header {
        padding: 0.5rem 0.5rem;
  }

  .navbar .container {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
  }

  .header-top {
        width: 100%;
        gap: 0.5rem;
        transition: all 0.3s ease;
  }

  .header-top.hidden {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        margin: 0;
        padding: 0;
  }

  .mobile-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
  }

  .search-toggle-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 1.2rem;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        border-radius: 20px;
        min-width: 44px;
        height: 38px;
  }

  .search-toggle-btn:hover {
        background: rgba(255, 255, 255, 0.3);
  }

  .search-toggle-btn:active {
        transform: scale(0.95);
  }

  .site-name {
        font-size: 1.5rem;
        text-align: center;
  }

  .search-bar {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0;
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition: all 0.3s ease;
  }

  .search-bar.search-expanded {
        max-height: 50px;
        opacity: 1;
        padding: 0;
  }

  .search-bar .input-group {
        border-radius: 20px;
        overflow: hidden;
        position: relative;
        height: 38px;
  }

  .search-bar input {
        border-radius: 20px;
        padding: 0.5rem 80px 0.5rem 1rem;
        height: 38px;
        font-size: 0.9rem;
  }

  .search-bar .search-btn {
        position: absolute;
        right: 40px;
        top: 0;
        bottom: 0;
        border-radius: 0;
        z-index: 2;
        border: none;
        padding: 0 0.75rem;
  }

  .search-bar .close-search-btn {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        border-radius: 0 20px 20px 0;
        z-index: 2;
        border: none;
        background: rgba(255, 59, 48, 0.8);
        padding: 0 0.75rem;
  }

  .search-bar .close-search-btn:hover {
        background: rgba(255, 59, 48, 1);
  }

  .navbar-collapse {
        width: 100%;
  }

  .nav-icons {
        width: 100%;
        margin-top: 0.5rem;
        gap: 0.75rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
  }

  .nav-icon {
        width: 100%;
        flex-direction: row;
        align-items: center;
        text-align: left;
        gap: 1rem;
        padding: 0.5rem 0;
  }

  .nav-icon i {
        font-size: 1.2rem;
        margin-bottom: 0;
  }

  .nav-icon span {
        font-size: 0.85rem;
        text-align: left;
  }
}

@media (min-width: 769px) {
      .navbar-collapse {
                        max-height: none;
                        opacity: 1;
                        overflow: visible;
                        transform: none;
                        display: flex !important;
                        justify-content: flex-end;
      }

      .navbar-toggler {
            display: none;
      }

      .mobile-actions {
            display: none;
      }

      .search-toggle-btn,
      .close-search-btn {
            display: none !important;
      }

      .header-top {
            width: auto;
            gap: 1.5rem;
      }

      .search-bar {
            max-width: 500px;
            margin: 0 1.5rem;
            opacity: 1 !important;
            max-height: none !important;
      }

      .search-bar .search-btn {
            position: static;
      }
}
</style>