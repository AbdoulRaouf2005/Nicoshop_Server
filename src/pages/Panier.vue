<template>
      <div>
            <div v-if="cartStore.cart.length === 0" class="empty-state">
                  <i class="fas fa-shopping-cart fa-3x Big"></i>
                  <h3>Votre panier est vide</h3>
                  <p>Ajoutez des produits pour commencer vos achats</p>
                  <RouterLink to="/" class="btn btn-primary">
                        <i class="fas fa-shopping-bag me-2"></i>
                        Découvrir les produits
                  </RouterLink>
            </div>
            <div v-else class="row">
                  <div class="col-lg-8">
                        <div class="cart-item" v-for="item in cartStore.cart" :key="item.id">
                              <div class="row align-items-center">
                                    <div class="col-md-2">
                                          <img :src="item.image" :alt="item.name" class="img-fluid rounded">
                                    </div>
                                    <div class="col-md-4">
                                          <h5>{{ item.name }}</h5>
                                          <p class="text-muted mb-0">{{ item.price }} FCFA</p>
                                    </div>
                                    <div class="col-md-3">
                                          <div class="input-group">
                                                <button class="btn btn-outline-secondary"
                                                      @click="cartStore.decreaseQuantity(item)">-</button>
                                                <input type="text" class="form-control text-center"
                                                      :value="item.quantity" readonly>
                                                <button class="btn btn-outline-secondary"
                                                      @click="cartStore.increaseQuantity(item)">+</button>
                                          </div>
                                    </div>
                                    <div class="col-md-2 text-end">
                                          <strong>{{ (item.price * item.quantity).toFixed(0) }} FCFA</strong>
                                    </div>
                                    <div class="col-md-1 text-end">
                                          <button class="btn btn-danger btn-sm" @click="cartStore.removeFromCart(item)">
                                                <i class="fas fa-trash"></i>
                                          </button>
                                    </div>
                              </div>
                        </div>
                  </div>
                  <div class="col-lg-4">
                        <div class="cart-summary">
                              <h4 class="mb-4">Récapitulatif</h4>
                              
                              <!-- Sélection de la région de livraison -->
                              <div class="mb-3">
                                    <label class="form-label fw-bold">Région de livraison</label>
                                    <select class="form-select" v-model="selectedRegion" @change="updateDeliveryFee">
                                          <option value="">Sélectionner une région</option>
                                          <option value="Niamey">Niamey</option>
                                          <option value="Agadez">Agadez</option>
                                          <option value="Diffa">Diffa</option>
                                          <option value="Dosso">Dosso</option>
                                          <option value="Maradi">Maradi</option>
                                          <option value="Tahoua">Tahoua</option>
                                          <option value="Tillabéri">Tillabéri</option>
                                          <option value="Zinder">Zinder</option>
                                    </select>
                              </div>

                              <div class="d-flex justify-content-between mb-2">
                                    <span>Sous-total:</span>
                                    <strong>{{ cartStore.cartTotal.toFixed(0) }} FCFA</strong>
                              </div>
                              <div class="d-flex justify-content-between mb-2">
                                    <span>Livraison:</span>
                                    <strong v-if="!selectedRegion" class="text-muted">Choisir une région</strong>
                                    <strong v-else-if="deliveryFee === 0">Gratuite</strong>
                                    <strong v-else>{{ deliveryFee.toFixed(0) }} FCFA</strong>
                              </div>
                              <hr>
                              <div class="d-flex justify-content-between mb-4">
                                    <h5>Total:</h5>
                                    <h5 class="text-primary">{{ totalWithDelivery.toFixed(0) }} FCFA</h5>
                              </div>
                              <button class="btn btn-primary w-100 btn-lg mb-3" 
                                    @click="showPaymentModal = true" 
                                    :disabled="!selectedRegion">
                                    <i class="fas fa-lock"></i> Procéder au paiement
                              </button>
                              <small class="text-muted" v-if="!selectedRegion">
                                    <i class="fas fa-info-circle"></i> Veuillez sélectionner une région de livraison
                              </small>
                        </div>
                  </div>
            </div>

            <!-- Modal de paiement -->
            <div class="payment-modal-overlay" v-if="showPaymentModal" @click="closePaymentModal">
                  <div class="payment-modal" @click.stop>
                        <div class="payment-modal-header">
                              <h3>💳 Choisir un mode de paiement</h3>
                              <button class="close-modal-btn" @click="closePaymentModal">
                                    <i class="fas fa-times"></i>
                              </button>
                        </div>

                        <div class="payment-modal-body">
                              <div class="payment-total-display">
                                    <span>Montant à payer:</span>
                                    <strong>{{ totalWithDelivery.toFixed(0) }} FCFA</strong>
                              </div>
                              <div class="delivery-info mb-3">
                                    <i class="fas fa-map-marker-alt"></i> 
                                    Livraison: <strong>{{ selectedRegion }}</strong>
                              </div>

                              <!-- Sélection du mode de paiement -->
                              <div class="payment-methods" v-if="!selectedPaymentMethod">
                                    <button class="payment-method-btn" @click="selectPaymentMethod('stripe')">
                                          <i class="fab fa-stripe"></i>
                                          <div>
                                                <strong>Carte bancaire (Stripe)</strong>
                                                <small>Visa, Mastercard, Amex</small>
                                          </div>
                                    </button>

                                    <button class="payment-method-btn" @click="selectPaymentMethod('paypal')">
                                          <i class="fab fa-paypal"></i>
                                          <div>
                                                <strong>PayPal</strong>
                                                <small>Paiement sécurisé</small>
                                          </div>
                                    </button>

                                    <button class="payment-method-btn" @click="selectPaymentMethod('card')">
                                          <i class="fas fa-credit-card"></i>
                                          <div>
                                                <strong>Carte bancaire</strong>
                                                <small>Paiement direct</small>
                                          </div>
                                    </button>

                                    <button class="payment-method-btn" @click="selectPaymentMethod('mobile')">
                                          <i class="fas fa-mobile-alt"></i>
                                          <div>
                                                <strong>Mobile Money</strong>
                                                <small>Orange, MTN, Moov</small>
                                          </div>
                                    </button>
                              </div>

                              <!-- Formulaire Stripe -->
                              <div v-if="selectedPaymentMethod === 'stripe'" class="payment-form">
                                    <button class="btn-back" @click="selectedPaymentMethod = null">
                                          <i class="fas fa-arrow-left"></i> Retour
                                    </button>
                                    <h5 class="mb-3">Paiement Stripe</h5>
                                    <p class="text-muted">Vous serez redirigé vers la page de paiement sécurisée Stripe
                                    </p>
                                    <button class="btn btn-primary w-100" @click="processStripePayment"
                                          :disabled="isProcessing">
                                          <span v-if="isProcessing">
                                                <i class="fas fa-spinner fa-spin"></i> Traitement...
                                          </span>
                                          <span v-else>Payer {{ totalWithDelivery.toFixed(0) }} FCFA</span>
                                    </button>
                              </div>

                              <!-- Formulaire PayPal -->
                              <div v-if="selectedPaymentMethod === 'paypal'" class="payment-form">
                                    <button class="btn-back" @click="selectedPaymentMethod = null">
                                          <i class="fas fa-arrow-left"></i> Retour
                                    </button>
                                    <h5 class="mb-3">Paiement PayPal</h5>
                                    <p class="text-muted">Vous serez redirigé vers PayPal pour finaliser votre paiement
                                    </p>
                                    <button class="btn btn-primary w-100" @click="processPayPalPayment"
                                          :disabled="isProcessing">
                                          <span v-if="isProcessing">
                                                <i class="fas fa-spinner fa-spin"></i> Traitement...
                                          </span>
                                          <span v-else>Payer {{ totalWithDelivery.toFixed(0) }} FCFA</span>
                                    </button>
                              </div>

                              <!-- Formulaire Carte bancaire -->
                              <div v-if="selectedPaymentMethod === 'card'" class="payment-form">
                                    <button class="btn-back" @click="selectedPaymentMethod = null">
                                          <i class="fas fa-arrow-left"></i> Retour
                                    </button>
                                    <h5 class="mb-3">Paiement par carte</h5>
                                    <form @submit.prevent="processCardPayment">
                                          <div class="mb-3">
                                                <label class="form-label">Numéro de carte</label>
                                                <input type="text" class="form-control" v-model="cardDetails.number"
                                                      @input="formatCardInput" placeholder="1234 5678 9012 3456"
                                                      maxlength="19" required>
                                                <small class="text-muted" v-if="cardType">Type: {{ cardType }}</small>
                                          </div>
                                          <div class="row">
                                                <div class="col-6 mb-3">
                                                      <label class="form-label">Date d'expiration</label>
                                                      <input type="text" class="form-control"
                                                            v-model="cardDetails.expiry" @input="formatExpiryInput"
                                                            placeholder="MM/AA" maxlength="5" required>
                                                </div>
                                                <div class="col-6 mb-3">
                                                      <label class="form-label">CVV</label>
                                                      <input type="text" class="form-control" v-model="cardDetails.cvv"
                                                            placeholder="123" maxlength="4" required>
                                                </div>
                                          </div>
                                          <div class="mb-3">
                                                <label class="form-label">Nom sur la carte</label>
                                                <input type="text" class="form-control" v-model="cardDetails.name"
                                                      placeholder="JEAN DUPONT" required>
                                          </div>
                                          <button type="submit" class="btn btn-primary w-100" :disabled="isProcessing">
                                                <span v-if="isProcessing">
                                                      <i class="fas fa-spinner fa-spin"></i> Traitement...
                                                </span>
                                                <span v-else>Payer {{ totalWithDelivery.toFixed(0) }} FCFA</span>
                                          </button>
                                    </form>
                              </div>

                              <!-- Formulaire Mobile Money -->
                              <div v-if="selectedPaymentMethod === 'mobile'" class="payment-form">
                                    <button class="btn-back" @click="selectedPaymentMethod = null">
                                          <i class="fas fa-arrow-left"></i> Retour
                                    </button>
                                    <h5 class="mb-3">Mobile Money</h5>
                                    <form @submit.prevent="processMobilePayment">
                                          <div class="mb-3">
                                                <label class="form-label">Opérateur</label>
                                                <select class="form-select" v-model="mobileDetails.provider" required>
                                                      <option value="">Choisir un opérateur</option>
                                                      <option value="Orange Money">Orange Money</option>
                                                      <option value="MTN Money">MTN Money</option>
                                                      <option value="Moov Money">Moov Money</option>
                                                </select>
                                          </div>
                                          <div class="mb-3">
                                                <label class="form-label">Numéro de téléphone</label>
                                                <input type="tel" class="form-control" v-model="mobileDetails.phone"
                                                      placeholder="+227 XX XX XX XX" required>
                                          </div>
                                          <div class="alert alert-info">
                                                <i class="fas fa-info-circle"></i>
                                                Vous recevrez une notification sur votre téléphone pour valider le
                                                paiement
                                          </div>
                                          <button type="submit" class="btn btn-primary w-100" :disabled="isProcessing">
                                                <span v-if="isProcessing">
                                                      <i class="fas fa-spinner fa-spin"></i> Traitement...
                                                </span>
                                                <span v-else>Envoyer la demande</span>
                                          </button>
                                    </form>
                              </div>
                        </div>
                  </div>
            </div>
      </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { ordersAPI, usersAPI } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const showPaymentModal = ref(false)
const selectedPaymentMethod = ref(null)
const isProcessing = ref(false)

// Région de livraison
const selectedRegion = ref(authStore.user?.shipping_region || '')
const deliveryFee = ref(0)
const lastSavedRegion = ref(selectedRegion.value || '')

// Frais de livraison par région
const deliveryFees = {
      'Niamey': 0,        // Gratuit pour la capitale
      'Agadez': 15,
      'Diffa': 12,
      'Dosso': 8,
      'Maradi': 10,
      'Tahoua': 10,
      'Tillabéri': 8,
      'Zinder': 12
}

// Total avec livraison
const totalWithDelivery = computed(() => {
      return cartStore.cartTotal + deliveryFee.value
})

// Mise à jour des frais de livraison
const updateDeliveryFee = () => {
      if (selectedRegion.value) {
            deliveryFee.value = deliveryFees[selectedRegion.value] || 0
            persistRegion()
      } else {
            deliveryFee.value = 0
      }
}

// Persister la région de livraison côté profil
const persistRegion = async () => {
      if (!authStore.isAuthenticated) return
      if (lastSavedRegion.value === selectedRegion.value) return
      try {
            await usersAPI.updateShippingRegion(selectedRegion.value)
            lastSavedRegion.value = selectedRegion.value
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: `✓ Région enregistrée: ${selectedRegion.value}` }
            }))
      } catch (error) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: '❌ Erreur lors de la sauvegarde de la région' }
            }))
      }
}

// Initialiser les frais si une région est déjà connue
if (selectedRegion.value) {
      updateDeliveryFee()
}

// Détails de la carte bancaire
const cardDetails = ref({
      number: '',
      expiry: '',
      cvv: '',
      name: ''
})

// Détails Mobile Money
const mobileDetails = ref({
      provider: '',
      phone: ''
})

// Type de carte détecté
const cardType = computed(() => {
      if (cardDetails.value.number.length > 0) {
            // Détection simple du type de carte
            const num = cardDetails.value.number.replace(/\s/g, '')
            if (/^4/.test(num)) return 'VISA'
            if (/^5[1-5]/.test(num)) return 'MASTERCARD'
            if (/^3[47]/.test(num)) return 'AMEX'
            return ''
      }
      return ''
})

const selectPaymentMethod = (method) => {
      selectedPaymentMethod.value = method
}

const closePaymentModal = () => {
      showPaymentModal.value = false
      selectedPaymentMethod.value = null
      resetForms()
}

const resetForms = () => {
      cardDetails.value = { number: '', expiry: '', cvv: '', name: '' }
      mobileDetails.value = { provider: '', phone: '' }
}

// Formatage automatique du numéro de carte
const formatCardInput = (e) => {
      let value = e.target.value.replace(/\s/g, '')
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
      cardDetails.value.number = formattedValue
}

// Formatage de la date d'expiration
const formatExpiryInput = (e) => {
      let value = e.target.value.replace(/\D/g, '')
      if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4)
      }
      cardDetails.value.expiry = value
}

// Traitement Stripe (simulation)
const processStripePayment = async () => {
      isProcessing.value = true
      try {
            // Créer la commande avec paiement Stripe
            const orderData = {
                  items: cartStore.cart,
                  total: totalWithDelivery.value,
                  payment_method: 'stripe',
                  shipping_address: selectedRegion.value,
                  shipping_region: selectedRegion.value,
                  delivery_fee: deliveryFee.value,
                  currency: 'FCFA'
            }
            await ordersAPI.create(orderData)
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: `✓ Paiement Stripe simulé - Livraison à ${selectedRegion.value}` }
            }))
            cartStore.checkout()
            closePaymentModal()
            router.push('/Profil')
      } catch (error) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: '❌ Erreur lors du paiement' }
            }))
      } finally {
            isProcessing.value = false
      }
}

// Traitement PayPal (simulation)
const processPayPalPayment = async () => {
      isProcessing.value = true
      try {
            // Créer la commande avec paiement PayPal
            const orderData = {
                  items: cartStore.cart,
                  total: totalWithDelivery.value,
                  payment_method: 'paypal',
                  shipping_address: selectedRegion.value,
                  shipping_region: selectedRegion.value,
                  delivery_fee: deliveryFee.value,
                  currency: 'FCFA'
            }
            await ordersAPI.create(orderData)
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: `✓ Paiement PayPal simulé - Livraison à ${selectedRegion.value}` }
            }))
            cartStore.checkout()
            closePaymentModal()
            router.push('/Profil')
      } catch (error) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: '❌ Erreur lors du paiement' }
            }))
      } finally {
            isProcessing.value = false
      }
}

// Traitement Carte bancaire (simulation)
const processCardPayment = async () => {
      isProcessing.value = true
      try {
            // Validation simple
            if (cardDetails.value.number.length < 13) {
                  throw new Error('Numéro de carte invalide')
            }
            // Créer la commande avec paiement par carte
            const orderData = {
                  items: cartStore.cart,
                  total: totalWithDelivery.value,
                  payment_method: 'card',
                  shipping_address: selectedRegion.value,
                  shipping_region: selectedRegion.value,
                  delivery_fee: deliveryFee.value,
                  currency: 'FCFA'
            }
            await ordersAPI.create(orderData)
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: `✓ Paiement par carte simulé - Livraison à ${selectedRegion.value}` }
            }))
            cartStore.checkout()
            closePaymentModal()
            router.push('/Profil')
      } catch (error) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: '❌ ' + (error.message || 'Erreur lors du paiement') }
            }))
      } finally {
            isProcessing.value = false
      }
}

// Traitement Mobile Money (simulation)
const processMobilePayment = async () => {
      isProcessing.value = true
      try {
            // Validation simple
            if (!mobileDetails.value.phone) {
                  throw new Error('Numéro de téléphone requis')
            }
            // Créer la commande avec paiement Mobile Money
            const orderData = {
                  items: cartStore.cart,
                  total: totalWithDelivery.value,
                  payment_method: 'mobile_money',
                  shipping_address: selectedRegion.value,
                  shipping_region: selectedRegion.value,
                  delivery_fee: deliveryFee.value,
                  currency: 'FCFA'
            }
            await ordersAPI.create(orderData)
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: `✓ Paiement Mobile Money simulé - Livraison à ${selectedRegion.value}` }
            }))
            cartStore.checkout()
            closePaymentModal()
            router.push('/Profil')
      } catch (error) {
            window.dispatchEvent(new CustomEvent('show-toast', {
                  detail: { message: '❌ ' + (error.message || 'Erreur lors du paiement') }
            }))
      } finally {
            isProcessing.value = false
      }
}
</script>

<style scoped>
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

.cart-summary {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 100px;
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


/* Modal de paiement */
.payment-modal-overlay {
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

.payment-modal {
      background: white;
      border-radius: 15px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.payment-modal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 15px 15px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
}

.payment-modal-header h3 {
      margin: 0;
      font-size: 1.5rem;
}

.close-modal-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
}

.payment-modal-body {
      padding: 2rem;
}

.payment-total-display {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      font-size: 1.2rem;
}

.payment-total-display strong {
      color: #667eea;
      font-size: 1.5rem;
}

.delivery-info {
      background: #e8f4f8;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.95rem;
      color: #333;
      border-left: 4px solid #667eea;
}

.delivery-info i {
      color: #667eea;
      margin-right: 0.5rem;
}

.payment-methods {
      display: flex;
      flex-direction: column;
      gap: 1rem;
}

.payment-method-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      text-align: left;
}

.payment-method-btn:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.payment-method-btn i {
      font-size: 2rem;
      color: #667eea;
      width: 50px;
      text-align: center;
}

.payment-method-btn strong {
      display: block;
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
}

.payment-method-btn small {
      color: #666;
}

.payment-form {
      animation: slideIn 0.3s ease;
}

@keyframes slideIn {
      from {
            opacity: 0;
            transform: translateX(-20px);
      }

      to {
            opacity: 1;
            transform: translateX(0);
      }
}

.btn-back {
      background: none;
      border: none;
      color: #667eea;
      padding: 0.5rem;
      margin-bottom: 1rem;
      cursor: pointer;
      font-weight: 500;
}

.btn-back:hover {
      text-decoration: underline;
}

.form-label {
      font-weight: 600;
      margin-bottom: 0.5rem;
}

.form-control,
.form-select {
      border-radius: 8px;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
}

.form-control:focus,
.form-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

.alert-info {
      background-color: #e7f3ff;
      border: 1px solid #b3d9ff;
      border-radius: 8px;
      padding: 1rem;
      font-size: 0.9rem;
}
</style>