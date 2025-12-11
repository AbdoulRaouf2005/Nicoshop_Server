import { defineStore } from 'pinia'
import { ref } from 'vue'
import { oauthService } from '@/services/oauthService'
import { authAPI, saveToken, removeToken, hasToken } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
      const isAuthenticated = ref(hasToken())
      const user = ref(null)
      const token = ref(sessionStorage.getItem('auth_token'))
      const theme = ref(localStorage.getItem('theme') || 'light')

      // Appliquer le thème sur document
      const applyThemeClass = (t) => {
            if (typeof document !== 'undefined') {
                  if (t === 'dark') document.documentElement.classList.add('dark')
                  else document.documentElement.classList.remove('dark')
            }
      }

      // Charger l'utilisateur depuis le localStorage au démarrage
      const loadUser = () => {
            const savedUser = sessionStorage.getItem('user_data')
            if (savedUser) {
                  user.value = JSON.parse(savedUser)
                  isAuthenticated.value = true
                  // si l'utilisateur a un thème enregistré, l'utiliser
                  if (user.value.theme) {
                        theme.value = user.value.theme
                        localStorage.setItem('theme', theme.value)
                  }
            }
            // appliquer le thème (priorité: user -> localStorage)
            applyThemeClass(theme.value)
      }

      // Sauvegarder l'utilisateur dans le localStorage
      const saveUser = (userData) => {
            sessionStorage.setItem('user_data', JSON.stringify(userData))
            user.value = userData
            // si userData contient theme, synchroniser
            if (userData?.theme) {
                  theme.value = userData.theme
                  localStorage.setItem('theme', theme.value)
                  applyThemeClass(theme.value)
            }
      }

      const login = async (email, password) => {
            try {
                  const response = await authAPI.login(email, password)

                  saveToken(response.token)
                  saveUser(response.user)
                  token.value = response.token
                  isAuthenticated.value = true

                  window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message: '✓ Connexion réussie !' }
                  }))

                  // ⭐ MODIFICATION : Retourner le rôle pour redirection
                  return {
                        success: true,
                        role: response.user.role  // 'admin' ou 'customer'
                  }
            } catch (error) {
                  console.error('Erreur de connexion:', error)
                  window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message: `❌ ${error.message}` }
                  }))
                  return {
                        success: false,
                        role: null
                  }
            }
      }
      const loginWithGoogle = async () => {
            try {
                  // Récupérer les données depuis Google OAuth
                  const userData = await oauthService.loginWithGoogle()

                  // ⭐ ENVOYER AU BACKEND pour sauvegarder dans MySQL
                  const response = await authAPI.oauth({
                        email: userData.email,
                        name: userData.name,
                        provider: 'google',
                        oauth_id: userData.id || userData.email,  // Identifiant unique Google
                        picture: userData.picture
                  })

                  // Sauvegarder le token et l'utilisateur
                  saveToken(response.token)
                  saveUser(response.user)
                  token.value = response.token
                  isAuthenticated.value = true

                  window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message: '✓ ' + response.message }
                  }))

                  return {
                        success: true,
                        role: response.user.role
                  }
            } catch (error) {
                  console.error('Erreur connexion Google:', error)
                  window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message: '❌ Erreur lors de la connexion avec Google' }
                  }))
                  return {
                        success: false,
                        role: null
                  }
            }
      }

      const loginWithFacebook = async () => {
            try {
                  // Récupérer les données depuis Facebook OAuth
                  const userData = await oauthService.loginWithFacebook()

                  // ⭐ ENVOYER AU BACKEND pour sauvegarder dans MySQL
                  const response = await authAPI.oauth({
                        email: userData.email,
                        name: userData.name,
                        provider: 'facebook',
                        oauth_id: userData.id || userData.email,  // Identifiant unique Facebook
                        picture: userData.picture
                  })

                  // Sauvegarder le token et l'utilisateur
                  saveToken(response.token)
                  saveUser(response.user)
                  token.value = response.token
                  isAuthenticated.value = true

                  window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message: '✓ ' + response.message }
                  }))

                  return {
                        success: true,
                        role: response.user.role
                  }
            } catch (error) {
                  console.error('Erreur connexion Facebook:', error)
                  window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message: '❌ Erreur lors de la connexion avec Facebook' }
                  }))
                  return {
                        success: false,
                        role: null
                  }
            }
      }
      const register = async (email, password, name) => {
            try {
                  // ⭐ UTILISER L'API au lieu de la simulation
                  const response = await authAPI.register(name, email, password)

              saveToken(response.token)
              saveUser(response.user)
              token.value = response.token
              isAuthenticated.value = true

              window.dispatchEvent(new CustomEvent('show-toast', {
                    detail: { message: '✓ Inscription réussie !' }
              }))          
              return true
            } catch (error) {
                  console.error('Erreur d\'inscription:', error)
                  window.dispatchEvent(new CustomEvent('show-toast', {
                        detail: { message: `❌ ${error.message}` }
                  }))
                  return false
            }
      }

      const logout = async () => {
            // Déconnexion des providers OAuth si nécessaire
            if (user.value?.provider === 'google') {
                  oauthService.logoutGoogle()
            } else if (user.value?.provider === 'facebook') {
                  await oauthService.logoutFacebook()
            }

            removeToken()
            sessionStorage.removeItem('user_data')
            isAuthenticated.value = false
            user.value = null
            token.value = null
      }

      // Toggle / set theme
      const setTheme = async (t) => {
            theme.value = t
            localStorage.setItem('theme', t)
            applyThemeClass(t)
            // Persister côté backend si connecté
            try {
                  if (isAuthenticated.value) {
                        // appeler API pour mettre à jour le thème utilisateur
                        const { usersAPI } = await import('@/services/api')
                        await usersAPI.updateTheme(t)
                        // mettre à jour la copie user en session
                        const u = JSON.parse(sessionStorage.getItem('user_data') || '{}')
                        u.theme = t
                        sessionStorage.setItem('user_data', JSON.stringify(u))
                        user.value = u
                  }
            } catch (err) {
                  console.warn('Impossible de sauvegarder le thème côté serveur:', err)
            }
      }

      const toggleTheme = () => {
            setTheme(theme.value === 'dark' ? 'light' : 'dark')
      }

      // Charger l'utilisateur au démarrage
      loadUser()

      return {
            isAuthenticated,
            user,
            token,
            theme,
            setTheme,
            toggleTheme,
            login,
            loginWithGoogle,
            loginWithFacebook,
            register,
            logout
      }
})