/**
 * Service d'authentification OAuth pour Google et Facebook
 * 
 * CONFIGURATION REQUISE:
 * 
 * 1. GOOGLE OAuth:
 *    - Aller sur: https://console.cloud.google.com/
 *    - Créer un projet
 *    - Activer Google+ API
 *    - Créer des identifiants OAuth 2.0
 *    - Ajouter les origines autorisées (http://localhost:5173)
 *    - Récupérer le Client ID
 * 
 * 2. FACEBOOK Login:
 *    - Aller sur: https://developers.facebook.com/
 *    - Créer une application
 *    - Ajouter Facebook Login
 *    - Configurer les paramètres OAuth
 *    - Récupérer l'App ID
 */

export const oauthService = {
  // Configuration Google OAuth
  googleConfig: {
    clientId: '998967711544-146g7tuuodq9lj0cpsmebqm2fkajrc13.apps.googleusercontent.com',
    scope: 'email profile',
    redirectUri: window.location.origin
  },

  // Configuration Facebook OAuth
  facebookConfig: {
    appId: 'VOTRE_FACEBOOK_APP_ID',
    scope: 'email,public_profile',
    redirectUri: window.location.origin
  },

  /**
   * Initialise le SDK Google
   */
  async initGoogleSDK() {
    return new Promise((resolve, reject) => {
      // Charger le SDK Google si pas déjà chargé
      if (window.google) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        // Initialiser Google Identity Services
        window.google.accounts.id.initialize({
          client_id: this.googleConfig.clientId,
          callback: this.handleGoogleCallback
        })
        resolve()
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  },

  /**
   * Initialise le SDK Facebook
   */
  async initFacebookSDK() {
    return new Promise((resolve, reject) => {
      // Charger le SDK Facebook si pas déjà chargé
      if (window.FB) {
        resolve()
        return
      }

      window.fbAsyncInit = () => {
        window.FB.init({
          appId: this.facebookConfig.appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        })
        resolve()
      }

      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.onerror = reject
      document.head.appendChild(script)
    })
  },

  /**
   * Connexion avec Google
   */
  async loginWithGoogle() {
    try {
      await this.initGoogleSDK()

      return new Promise((resolve, reject) => {
        // Afficher le popup de connexion Google
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            reject(new Error('Popup Google bloqué'))
          }
        })

        // Configuration du callback
        this.handleGoogleCallback = (response) => {
          try {
            // Décoder le JWT token
            const payload = this.parseJwt(response.credential)
            
            const userData = {
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              provider: 'google'
            }
            
            resolve(userData)
          } catch (error) {
            reject(error)
          }
        }

        // Alternative: Utiliser le bouton Google One Tap
        // window.google.accounts.id.renderButton(
        //   document.getElementById('googleButton'),
        //   { theme: 'outline', size: 'large' }
        // )
      })
    } catch (error) {
      console.error('Erreur Google OAuth:', error)
      throw error
    }
  },

  /**
   * Connexion avec Facebook
   */
  async loginWithFacebook() {
    try {
      await this.initFacebookSDK()

      return new Promise((resolve, reject) => {
        window.FB.login((response) => {
          if (response.authResponse) {
            // Récupérer les informations de l'utilisateur
            window.FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo) => {
              const userData = {
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture.data.url,
                provider: 'facebook'
              }
              resolve(userData)
            })
          } else {
            reject(new Error('Connexion Facebook annulée'))
          }
        }, { scope: this.facebookConfig.scope })
      })
    } catch (error) {
      console.error('Erreur Facebook OAuth:', error)
      throw error
    }
  },

  /**
   * Déconnexion Google
   */
  logoutGoogle() {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect()
    }
  },

  /**
   * Déconnexion Facebook
   */
  logoutFacebook() {
    return new Promise((resolve) => {
      if (window.FB) {
        window.FB.logout(() => {
          resolve()
        })
      } else {
        resolve()
      }
    })
  },

  /**
   * Parser un JWT token
   */
  parseJwt(token) {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  }
}