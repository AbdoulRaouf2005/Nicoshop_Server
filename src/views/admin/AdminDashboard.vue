<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1>🎛️ Dashboard Administrateur</h1>
      <p>Bienvenue, {{ authStore.user?.name }}</p>
    </div>

    <!-- Statistiques -->
    <div class="stats-grid">
      <div class="stat-card stat-revenue">
        <div class="stat-icon">
          <i class="fas fa-euro-sign"></i>
        </div>
        <div class="stat-details">
          <h3>{{ adminStore.stats.totalRevenue.toFixed(2) }} €</h3>
          <p>Revenu total</p>
        </div>
      </div>

      <div class="stat-card stat-orders">
        <div class="stat-icon">
          <i class="fas fa-shopping-bag"></i>
        </div>
        <div class="stat-details">
          <h3>{{ adminStore.stats.totalOrders }}</h3>
          <p>Commandes totales</p>
        </div>
      </div>

      <div class="stat-card stat-pending">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-details">
          <h3>{{ adminStore.stats.pendingOrders }}</h3>
          <p>En attente</p>
        </div>
      </div>

      <div class="stat-card stat-customers">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-details">
          <h3>{{ adminStore.stats.totalCustomers }}</h3>
          <p>Clients</p>
        </div>
      </div>
    </div>

    <!-- Onglets -->
    <div class="admin-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'orders' }"
        @click="activeTab = 'orders'">
        <i class="fas fa-shopping-cart"></i> Commandes
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'products' }"
        @click="activeTab = 'products'">
        <i class="fas fa-box"></i> Produits
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'">
        <i class="fas fa-users"></i> Utilisateurs
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'analytics' }"
        @click="activeTab = 'analytics'">
        <i class="fas fa-chart-line"></i> Analytiques
      </button>
    </div>

    <!-- Contenu des onglets -->
    <div class="tab-content">
      <!-- Onglet Commandes -->
      <div v-if="activeTab === 'orders'" class="orders-section">
        <div class="section-header">
          <h2>Gestion des commandes</h2>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Rechercher une commande..."
            v-model="searchQuery">
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id">
                <td><strong>{{ order.id }}</strong></td>
                <td>
                  <div>{{ order.customerName }}</div>
                  <small class="text-muted">{{ order.customerEmail }}</small>
                </td>
                <td>{{ formatDate(order.date) }}</td>
                <td><strong>{{ order.total.toFixed(2) }} €</strong></td>
                <td>
                  <select 
                    class="status-select"
                    :class="'status-' + order.status"
                    v-model="order.status"
                    @change="updateOrderStatus(order.id, order.status)">
                    <option value="pending">En attente</option>
                    <option value="completed">Complétée</option>
                    <option value="shipped">Expédiée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </td>
                <td>
                  <button class="btn-action btn-view" @click="viewOrder(order)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-action btn-delete" @click="confirmDeleteOrder(order.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Onglet Produits -->
      <div v-if="activeTab === 'products'" class="products-section">
        <div class="section-header">
          <h2>Gestion des produits</h2>
          <button class="btn-primary" @click="openProductModal()">
            <i class="fas fa-plus"></i> Ajouter un produit
          </button>
        </div>

        <div class="products-grid">
          <div class="product-admin-card" v-for="product in productStore.products" :key="product.id">
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
                <strong>{{ product.price }} €</strong>
                <div class="product-admin-actions">
                  <button class="btn-action btn-edit" @click="openProductModal(product)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-action btn-delete" @click="confirmDeleteProduct(product.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglet Utilisateurs -->
      <div v-if="activeTab === 'users'" class="users-section">
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
                    @change="updateUserStatus(user.id, user.status)">
                    <option value="active">Actif</option>
                    <option value="suspended">Suspendu</option>
                    <option value="banned">Banni</option>
                  </select>
                </td>
                <td>
                  <button 
                    class="btn-action btn-delete" 
                    @click="confirmDeleteUser(user.id)"
                    :disabled="user.role === 'admin'">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Onglet Analytiques -->
      <div v-if="activeTab === 'analytics'" class="analytics-section">
        <h2>Statistiques et analytiques</h2>
        
        <div class="analytics-grid">
          <div class="analytics-card">
            <h3>Répartition des commandes</h3>
            <div class="chart-placeholder">
              <div class="pie-chart">
                <div class="pie-slice" style="background: #667eea;">
                  <span>{{ adminStore.stats.completedOrders }}</span>
                </div>
                <div class="pie-info">
                  <p><span class="color-box" style="background: #667eea;"></span> Complétées: {{ adminStore.stats.completedOrders }}</p>
                  <p><span class="color-box" style="background: #ffa502;"></span> En attente: {{ adminStore.stats.pendingOrders }}</p>
                  <p><span class="color-box" style="background: #ff4757;"></span> Autres: {{ adminStore.stats.totalOrders - adminStore.stats.completedOrders - adminStore.stats.pendingOrders }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="analytics-card">
            <h3>Performances</h3>
            <div class="performance-stats">
              <div class="perf-item">
                <span class="perf-label">Panier moyen</span>
                <span class="perf-value">{{ adminStore.stats.averageOrderValue.toFixed(2) }} €</span>
              </div>
              <div class="perf-item">
                <span class="perf-label">Taux de conversion</span>
                <span class="perf-value">12.5%</span>
              </div>
              <div class="perf-item">
                <span class="perf-label">Clients actifs</span>
                <span class="perf-value">{{ adminStore.stats.totalCustomers }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails de commande -->
    <div class="modal-overlay" v-if="selectedOrder" @click="selectedOrder = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Détails de la commande {{ selectedOrder.id }}</h3>
          <button class="close-btn" @click="selectedOrder = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="order-details">
            <p><strong>Client:</strong> {{ selectedOrder.customerName }}</p>
            <p><strong>Email:</strong> {{ selectedOrder.customerEmail }}</p>
            <p><strong>Date:</strong> {{ formatDate(selectedOrder.date) }}</p>
            <p><strong>Statut:</strong> <span :class="'badge-' + selectedOrder.status">{{ getStatusLabel(selectedOrder.status) }}</span></p>
          </div>
          <h4>Articles commandés:</h4>
          <table class="order-items-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in selectedOrder.items" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.price.toFixed(2) }} €</td>
                <td><strong>{{ (item.price * item.quantity).toFixed(2) }} €</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="order-total">
            <h3>Total: {{ selectedOrder.total.toFixed(2) }} €</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Produit (Ajouter/Modifier) -->
    <div class="modal-overlay" v-if="showProductModal" @click="closeProductModal">
      <div class="modal-content product-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingProduct ? '✏️ Modifier le produit' : '➕ Ajouter un produit' }}</h3>
          <button class="close-btn" @click="closeProductModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProduct">
            <div class="form-group">
              <label class="form-label">Nom du produit *</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="productForm.name"
                placeholder="Ex: Smartphone Pro X"
                required>
            </div>

            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea 
                class="form-control" 
                v-model="productForm.description"
                placeholder="Décrivez le produit..."
                rows="4"
                required></textarea>
            </div>

            <div class="row">
              <div class="col-md-6 form-group">
                <label class="form-label">Prix (€) *</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="productForm.price"
                  placeholder="99.99"
                  step="0.01"
                  min="0"
                  required>
              </div>

              <div class="col-md-6 form-group">
                <label class="form-label">Stock *</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="productForm.stock"
                  placeholder="100"
                  min="0"
                  required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">URL de l'image *</label>
              <input 
                type="url" 
                class="form-control" 
                v-model="productForm.image"
                placeholder="https://exemple.com/image.jpg"
                required>
              <small class="form-text">Prévisualisez l'image ci-dessous</small>
            </div>

            <div class="image-preview" v-if="productForm.image">
              <img :src="productForm.image" alt="Prévisualisation" @error="imageError = true">
              <p v-if="imageError" class="text-danger">⚠️ L'URL de l'image semble invalide</p>
            </div>

            <div class="form-group">
              <label class="form-label">Catégorie</label>
              <select class="form-control" v-model="productForm.category">
                <option value="">Sélectionner une catégorie</option>
                <option value="Électronique">Électronique</option>
                <option value="Audio">Audio</option>
                <option value="Photo">Photo</option>
                <option value="Gaming">Gaming</option>
                <option value="Accessoires">Accessoires</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeProductModal">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSaving">
                <span v-if="isSaving">
                  <i class="fas fa-spinner fa-spin"></i> Enregistrement...
                </span>
                <span v-else>
                  <i class="fas fa-save"></i> {{ editingProduct ? 'Modifier' : 'Ajouter' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'
import { useProductStore } from '@/stores/produitStore'

const authStore = useAuthStore()
const adminStore = useAdminStore()
const productStore = useProductStore()

const activeTab = ref('orders')
const searchQuery = ref('')
const searchUserQuery = ref('')
const selectedOrder = ref(null)
const showProductModal = ref(false)
const editingProduct = ref(null)
const isSaving = ref(false)
const imageError = ref(false)

// Formulaire produit
const productForm = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  image: '',
  category: ''
})

// Filtrer les commandes
const filteredOrders = computed(() => {
  if (!searchQuery.value) return adminStore.orders
  
  const query = searchQuery.value.toLowerCase()
  return adminStore.orders.filter(order =>
    order.id.toLowerCase().includes(query) ||
    order.customerName.toLowerCase().includes(query) ||
    order.customerEmail.toLowerCase().includes(query)
  )
})

// Filtrer les utilisateurs
const filteredUsers = computed(() => {
  if (!searchUserQuery.value) return adminStore.users
  
  const query = searchUserQuery.value.toLowerCase()
  return adminStore.users.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// Classe CSS pour le stock
const getStockClass = (stock) => {
  if (stock === 0) return 'stock-out'
  if (stock < 10) return 'stock-low'
  return 'stock-ok'
}

// Formater une date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Label de statut
const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    completed: 'Complétée',
    shipped: 'Expédiée',
    cancelled: 'Annulée'
  }
  return labels[status] || status
}

// Voir les détails d'une commande
const viewOrder = (order) => {
  selectedOrder.value = order
}

// Mettre à jour le statut d'une commande
const updateOrderStatus = async (orderId, newStatus) => {
  const ok = await adminStore.updateOrderStatus(orderId, newStatus)
  if (ok) {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: '✓ Statut de la commande mis à jour' }
    }))
  }
}

// Confirmer la suppression d'une commande
const confirmDeleteOrder = async (orderId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return

  const ok = await adminStore.deleteOrder(orderId)
  if (ok) {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: '✓ Commande supprimée' }
    }))
  }
}

// Mettre à jour le statut d'un utilisateur
const updateUserStatus = (userId, newStatus) => {
  if (adminStore.updateUserStatus(userId, newStatus)) {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: '✓ Statut de l\'utilisateur mis à jour' }
    }))
  }
}

// Confirmer la suppression d'un utilisateur
const confirmDeleteUser = (userId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
    if (adminStore.deleteUser(userId)) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: '✓ Utilisateur supprimé' }
      }))
    }
  }
}

// Ouvrir le modal produit
const openProductModal = (product = null) => {
  if (product) {
    editingProduct.value = product
    productForm.value = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock || 0,
      image: product.image,
      category: product.category || ''
    }
  } else {
    editingProduct.value = null
    productForm.value = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      image: '',
      category: ''
    }
  }
  imageError.value = false
  showProductModal.value = true
}

// Fermer le modal produit
const closeProductModal = () => {
  showProductModal.value = false
  editingProduct.value = null
  imageError.value = false
}

// Sauvegarder le produit
const saveProduct = async () => {
  isSaving.value = true
  
  try {
    if (editingProduct.value) {
      // Modifier le produit existant via le store
      try {
        await productStore.updateProduct(editingProduct.value.id, {
          name: productForm.value.name,
          description: productForm.value.description,
          price: productForm.value.price,
          image: productForm.value.image,
          stock: productForm.value.stock,
          category: productForm.value.category
        })

        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: '✓ Produit modifié avec succès' }
        }))
      } catch (err) {
        console.error('Erreur modification produit:', err)
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '❌ Erreur lors de la modification' } }))
      }
    } else {
      // Ajouter un nouveau produit via le store
      try {
        await productStore.addProduct({
          name: productForm.value.name,
          description: productForm.value.description,
          price: productForm.value.price,
          image: productForm.value.image,
          stock: productForm.value.stock,
          category: productForm.value.category
        })
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { message: '✓ Produit ajouté avec succès' }
        }))
      } catch (err) {
        console.error('Erreur ajout produit:', err)
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '❌ Erreur lors de l\'ajout' } }))
      }
    }
    
    closeProductModal()
  } catch (error) {
    console.error('Erreur:', error)
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: '❌ Erreur lors de l\'enregistrement' }
    }))
  } finally {
    isSaving.value = false
  }
}

// Confirmer la suppression d'un produit
const confirmDeleteProduct = async (productId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

  try {
    await productStore.deleteProduct(productId)
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '✓ Produit supprimé' } }))
  } catch (err) {
    console.error('Erreur suppression produit:', err)
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: '❌ Erreur lors de la suppression' } }))
  }
}

// Charger les données au montage
  onMounted(async () => {
  await Promise.all([
    adminStore.fetchOrders(),
    productStore.fetchProducts(),
    adminStore.fetchUsers()
  ])
})
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem 0;
}

.admin-header {
  text-align: center;
  margin-bottom: 3rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.admin-header p {
  color: #666;
  font-size: 1.1rem;
}

/* Statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-revenue .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-orders .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-pending .stat-icon { background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%); }
.stat-customers .stat-icon { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }

.stat-details h3 {
  font-size: 2rem;
  margin: 0;
  color: #333;
}

.stat-details p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Onglets */
.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-btn i {
  margin-right: 0.5rem;
}

/* Contenu */
.tab-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.search-input {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  width: 300px;
  max-width: 100%;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

/* Table */
.table-responsive {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table thead {
  background: #f8f9fa;
}

.admin-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.admin-table tbody tr:hover {
  background: #f8f9fa;
}

.status-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.status-pending { color: #ffa502; border-color: #ffa502; }
.status-completed { color: #38ef7d; border-color: #38ef7d; }
.status-shipped { color: #667eea; border-color: #667eea; }
.status-cancelled { color: #ff4757; border-color: #ff4757; }
.status-active { color: #38ef7d; border-color: #38ef7d; }
.status-suspended { color: #ffa502; border-color: #ffa502; }
.status-banned { color: #ff4757; border-color: #ff4757; }

.btn-action {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.3s;
  margin: 0 0.25rem;
}

.btn-action:hover {
  transform: scale(1.2);
}

.btn-view { color: #667eea; }
.btn-edit { color: #ffa502; }
.btn-delete { color: #ff4757; }

.btn-action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.badge-admin {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge-customer {
  background: #38ef7d;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Grille de produits */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-admin-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s;
}

.product-admin-card:hover {
  border-color: #667eea;
  transform: translateY(-5px);
}

.product-admin-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-admin-info {
  padding: 1rem;
}

.product-admin-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.product-admin-info p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.product-admin-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-admin-actions {
  display: flex;
  gap: 0.5rem;
}

/* Analytiques */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.analytics-card {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 15px;
}

.analytics-card h3 {
  margin-top: 0;
  color: #333;
}

.pie-chart {
  text-align: center;
  padding: 2rem 0;
}

.pie-info {
  margin-top: 2rem;
}

.pie-info p {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: inline-block;
}

.performance-stats {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.perf-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-radius: 10px;
}

.perf-label {
  color: #666;
  font-weight: 500;
}

.perf-value {
  color: #667eea;
  font-weight: bold;
  font-size: 1.2rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 15px 15px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 2rem;
}

.order-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.order-details p {
  margin: 0.5rem 0;
}

.order-items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.order-items-table th,
.order-items-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.order-items-table thead {
  background: #f8f9fa;
}

.order-total {
  text-align: right;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #667eea;
}

.order-total h3 {
  color: #667eea;
  margin: 0;
}

@media (max-width: 768px) {
  .admin-tabs {
    overflow-x: auto;
  }

  .tab-btn {
    white-space: nowrap;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    width: 100%;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

.product-modal {
  max-width: 700px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.form-text {
  display: block;
  margin-top: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.image-preview {
  margin: 1rem 0;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.product-description {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-stock {
  margin-bottom: 0.75rem;
}

.stock-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
}

.stock-ok {
  background: #d4edda;
  color: #155724;
}

.stock-low {
  background: #fff3cd;
  color: #856404;
}

.stock-out {
  background: #f8d7da;
  color: #721c24;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.5rem;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding: 0 0.5rem;
}

@media (max-width: 768px) {
  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>