<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">🔐 Connexion</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="email" placeholder="votreemail@exemple.com" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Mot de passe</label>
          <input type="password" class="form-control" v-model="password" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn-primary-custom" :disabled="isLoading">
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin"></i> Connexion...
          </span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <div class="divider">
        <span>OU</span>
      </div>

      <button class="social-btn btn-google" @click="handleGoogleLogin" :disabled="isLoading">
        <i class="fab fa-google"></i>
        Continuer avec Google
      </button>

      <button class="social-btn btn-facebook" @click="handleFacebookLogin" :disabled="isLoading">
        <i class="fab fa-facebook"></i>
        Continuer avec Facebook
      </button>

      <div class="auth-footer">
        <p>Pas encore de compte ? <router-link to="/Inscription">Inscrivez-vous</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

// ⭐ MODIFICATION : Redirection selon le rôle
const handleLogin = async () => {
  isLoading.value = true
  
  try {
    const result = await authStore.login(email.value, password.value)
    
    if (result.success) {
      // ⭐ Rediriger selon le rôle
      if (result.role === 'admin') {
        router.push('/admin')  // Admin → Dashboard
      } else {
        router.push('/')  // Customer → Accueil
      }
    }
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  isLoading.value = true
  try {
    const result = await authStore.loginWithGoogle()
    if (result.success) {
      if (result.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  } catch (error) {
    console.error('Erreur Google:', error)
  } finally {
    isLoading.value = false
  }
}

const handleFacebookLogin = async () => {
  isLoading.value = true
  try {
    const result = await authStore.loginWithFacebook()
    if (result.success) {
      if (result.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  } catch (error) {
    console.error('Erreur Facebook:', error)
  } finally {
    isLoading.value = false
  }
}
</script>


<style scoped>
/* Auth Pages */
.auth-container {
      max-width: 450px;
      margin: 2rem auto;
}

.auth-card {
      background: white;
      border-radius: 15px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.auth-title {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
      font-size: 1.8rem;
      font-weight: bold;
}

.form-control {
      border-radius: 10px;
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      transition: border-color 0.3s;
}

.form-control:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
}

.btn-primary-custom {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 10px;
      padding: 0.75rem;
      color: white;
      font-weight: 600;
      width: 100%;
      transition: transform 0.3s;
}

.btn-primary-custom:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.divider {
      text-align: center;
      margin: 1.5rem 0;
      position: relative;
}

.divider::before,
.divider::after {
      content: "";
      position: absolute;
      top: 50%;
      width: 45%;
      height: 1px;
      background: #e0e0e0;
}

.divider::before {
      left: 0;
}

.divider::after {
      right: 0;
}

.divider span {
      background: white;
      padding: 0 1rem;
      color: #999;
}

.social-btn {
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      padding: 0.75rem;
      background: white;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
}

.social-btn:hover {
      border-color: #667eea;
      transform: translateY(-2px);
}

.social-btn i {
      font-size: 1.2rem;
}

.btn-google {
      color: #db4437;
}

.btn-facebook {
      color: #4267B2;
}

.auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
}

.auth-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
}

.auth-footer a:hover {
      text-decoration: underline;
}
</style>