# 🔐 Guide Complet : Intégration OAuth Google & Facebook

## 📋 Table des matières
1. [Configuration Google OAuth](#google-oauth)
2. [Configuration Facebook OAuth](#facebook-oauth)
3. [Code prêt à copier](#code)
4. [Test & Dépannage](#test)

---

## 🔵 Configuration Google OAuth {#google-oauth}

### Étape 1 : Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur "Sélectionner un projet" en haut
3. Cliquez sur "NOUVEAU PROJET"
4. Donnez un nom : `Nicoshop3.0`
5. Cliquez sur "CRÉER"

### Étape 2 : Activer Google+ API
1. Dans la barre de recherche, tapez `Google+ API`
2. Cliquez dessus dans les résultats
3. Cliquez sur "ACTIVER"

### Étape 3 : Créer les identifiants OAuth
1. Allez à "Identifiants" dans le menu de gauche
2. Cliquez sur "CRÉER DES IDENTIFIANTS"
3. Sélectionnez "ID client OAuth"
4. Sélectionnez "Application web" comme type
5. Dans "Origines JavaScript autorisées", ajoutez :
   ```
   http://localhost:5173
   http://localhost:3000
   ```
6. Dans "URI de redirection autorisés", ajoutez :
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:5173/
   http://localhost:3000/
   ```
7. Cliquez "CRÉER"
8. **Copiez le "ID Client"** (ressemble à : `xxxxx.apps.googleusercontent.com`)

### Étape 4 : Ajouter votre Client ID
Remplacez dans `/src/services/oauthService.js` :
```javascript
googleConfig: {
  clientId: 'VOTRE_CLIENT_ID_GOOGLE_ICI', // ← Remplacez ici
  scope: 'email profile',
  redirectUri: window.location.origin
}
```

---

## 🔴 Configuration Facebook OAuth {#facebook-oauth}

### Étape 1 : Créer une application Facebook
1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Cliquez sur "Mes applications" en haut à droite
3. Cliquez sur "Créer une application"
4. Choisissez "Consumer" comme type
5. Remplissez les informations :
   - **Nom de l'application** : `Nicoshop3.0`
   - **Email du contact** : votre email
   - Acceptez les conditions
6. Cliquez "Créer l'application"

### Étape 2 : Ajouter Facebook Login
1. Recherchez "Facebook Login" dans la barre de recherche des produits
2. Cliquez "Configurer"
3. Sélectionnez "Web"
4. Entrez votre URL : `http://localhost:5173`

### Étape 3 : Configurer les paramètres
1. Allez à "Paramètres" > "Général"
2. **Copiez l'ID de l'application** (affichée en haut)
3. Allez à "Paramètres" > "Utilisation avancée"
4. Dans "URIs de redirection OAuth valides", ajoutez :
   ```
   http://localhost:5173
   http://localhost:3000
   http://localhost:5173/
   http://localhost:3000/
   ```

### Étape 4 : Ajouter votre App ID
Remplacez dans `/src/services/oauthService.js` :
```javascript
facebookConfig: {
  appId: 'VOTRE_APP_ID_FACEBOOK_ICI', // ← Remplacez ici
  scope: 'email,public_profile',
  redirectUri: window.location.origin
}
```

---

## 💻 Code prêt à copier {#code}

### Version complète et optimisée de oauthService.js

Copiez-collez ce code dans `/src/services/oauthService.js` :

```javascript
/**
 * Service d'authentification OAuth pour Google et Facebook
 * 
 * ⚠️ AVANT DE L'UTILISER:
 * 1. Obtenez votre Google Client ID: https://console.cloud.google.com/
 * 2. Obtenez votre Facebook App ID: https://developers.facebook.com/
 * 3. Remplacez les valeurs ci-dessous
 */

export const oauthService = {
  // ========================================
  // 🔵 CONFIGURATION GOOGLE
  // ========================================
  googleConfig: {
    clientId: 'REMPLACEZ_PAR_VOTRE_GOOGLE_CLIENT_ID',
    scope: 'email profile',
    redirectUri: window.location.origin
  },

  // ========================================
  // 🔴 CONFIGURATION FACEBOOK
  // ========================================
  facebookConfig: {
    appId: 'REMPLACEZ_PAR_VOTRE_FACEBOOK_APP_ID',
    scope: 'email,public_profile',
    redirectUri: window.location.origin
  },

  // ========================================
  // ✅ INITIALISATION DU SDK GOOGLE
  // ========================================
  /**
   * Charge et initialise le SDK Google Identity Services
   */
  async initGoogleSDK() {
    return new Promise((resolve, reject) => {
      // Vérifier si déjà chargé
      if (window.google) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        try {
          window.google.accounts.id.initialize({
            client_id: this.googleConfig.clientId,
            callback: this.handleGoogleCallback
          })
          console.log('✅ Google SDK initialisé')
          resolve()
        } catch (err) {
          console.error('❌ Erreur initialisation Google:', err)
          reject(err)
        }
      }
      
      script.onerror = () => {
        console.error('❌ Impossible de charger Google SDK')
        reject(new Error('Impossible de charger Google SDK'))
      }
      
      document.head.appendChild(script)
    })
  },

  // ========================================
  // ✅ INITIALISATION DU SDK FACEBOOK
  // ========================================
  /**
   * Charge et initialise le SDK Facebook
   */
  async initFacebookSDK() {
    return new Promise((resolve, reject) => {
      // Vérifier si déjà chargé
      if (window.FB) {
        resolve()
        return
      }

      window.fbAsyncInit = () => {
        try {
          window.FB.init({
            appId: this.facebookConfig.appId,
            cookie: true,
            xfbml: false,
            version: 'v18.0'
          })
          console.log('✅ Facebook SDK initialisé')
          resolve()
        } catch (err) {
          console.error('❌ Erreur initialisation Facebook:', err)
          reject(err)
        }
      }

      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      
      script.onerror = () => {
        console.error('❌ Impossible de charger Facebook SDK')
        reject(new Error('Impossible de charger Facebook SDK'))
      }
      
      document.head.appendChild(script)
    })
  },

  // ========================================
  // 🔵 CONNEXION GOOGLE
  // ========================================
  /**
   * Ouvre le dialogue de connexion Google
   * @returns {Promise<Object>} Données utilisateur (email, name, picture)
   */
  async loginWithGoogle() {
    try {
      await this.initGoogleSDK()

      return new Promise((resolve, reject) => {
        // Afficher le prompt de connexion Google
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            // Si le prompt est bloqué, utiliser le bouton
            console.warn('⚠️ Google prompt bloqué, utilisant la méthode alternative')
          }
        })

        // Configurer le callback
        this.handleGoogleCallback = (response) => {
          try {
            if (!response.credential) {
              reject(new Error('Pas de token reçu'))
              return
            }

            // Décoder le JWT token
            const payload = this.parseJwt(response.credential)
            
            const userData = {
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              provider: 'google',
              oauth_id: payload.sub
            }
            
            console.log('✅ Utilisateur Google connecté:', userData.email)
            resolve(userData)
          } catch (error) {
            console.error('❌ Erreur décodage token Google:', error)
            reject(error)
          }
        }
      })
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error)
      throw error
    }
  },

  // ========================================
  // 🔴 CONNEXION FACEBOOK
  // ========================================
  /**
   * Ouvre le dialogue de connexion Facebook
   * @returns {Promise<Object>} Données utilisateur (email, name, picture)
   */
  async loginWithFacebook() {
    try {
      await this.initFacebookSDK()

      return new Promise((resolve, reject) => {
        window.FB.login((response) => {
          if (response.authResponse) {
            // Récupérer les informations de l'utilisateur
            window.FB.api('/me', { 
              fields: 'id,name,email,picture.height(200).width(200)' 
            }, (userInfo) => {
              if (userInfo.error) {
                reject(new Error('Impossible de récupérer les infos utilisateur'))
                return
              }

              const userData = {
                email: userInfo.email || userInfo.id + '@facebook.com',
                name: userInfo.name,
                picture: userInfo.picture?.data?.url,
                provider: 'facebook',
                oauth_id: userInfo.id
              }
              
              console.log('✅ Utilisateur Facebook connecté:', userData.email)
              resolve(userData)
            })
          } else {
            reject(new Error('Connexion Facebook annulée'))
          }
        }, { scope: this.facebookConfig.scope })
      })
    } catch (error) {
      console.error('❌ Erreur connexion Facebook:', error)
      throw error
    }
  },

  // ========================================
  // 🚪 DÉCONNEXION
  // ========================================
  /**
   * Déconnecte l'utilisateur de Google
   */
  logoutGoogle() {
    try {
      if (window.google) {
        window.google.accounts.id.disableAutoSelect()
        console.log('✅ Déconnexion Google')
      }
    } catch (err) {
      console.error('❌ Erreur déconnexion Google:', err)
    }
  },

  /**
   * Déconnecte l'utilisateur de Facebook
   */
  async logoutFacebook() {
    return new Promise((resolve) => {
      try {
        if (window.FB) {
          window.FB.logout(() => {
            console.log('✅ Déconnexion Facebook')
            resolve()
          })
        } else {
          resolve()
        }
      } catch (err) {
        console.error('❌ Erreur déconnexion Facebook:', err)
        resolve()
      }
    })
  },

  /**
   * Déconnecte de tous les services OAuth
   */
  async logoutAll() {
    this.logoutGoogle()
    await this.logoutFacebook()
  },

  // ========================================
  // 🔧 UTILITAIRES
  // ========================================
  /**
   * Décoder un JWT token
   * @param {string} token - Le token JWT
   * @returns {Object} Payload décodé
   */
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (err) {
      console.error('❌ Erreur parsing JWT:', err)
      throw new Error('Token invalide')
    }
  }
}
```

---

## 🧪 Test & Dépannage {#test}

### Checklist avant test
- [ ] ✅ Client ID Google ajouté dans `oauthService.js`
- [ ] ✅ App ID Facebook ajouté dans `oauthService.js`
- [ ] ✅ Origines autorisées ajoutées dans Google Cloud Console
- [ ] ✅ URIs de redirection ajoutées dans Facebook Developers
- [ ] ✅ `npm run dev` en cours d'exécution

### Test étape par étape

1. **Ouvrez** http://localhost:5173/Connexion
2. **Cliquez** sur "Continuer avec Google"
   - ✅ Attendez-vous à voir : popup de Google
   - ❌ Si erreur : vérifiez la console (F12 > Console)

3. **Cliquez** sur "Continuer avec Facebook"
   - ✅ Attendez-vous à voir : popup de Facebook
   - ❌ Si erreur : vérifiez la console

### Erreurs courantes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Failed to load Google SDK` | SDK non accessible | Vérifiez votre connexion internet |
| `Invalid client ID` | Client ID incorrect | Vérifiez le Client ID dans Google Cloud |
| `CORS error` | Origine non autorisée | Ajoutez `http://localhost:5173` dans Google Cloud |
| `redirect_uri_mismatch` | URI non autorisée | Ajoutez l'URI dans Facebook Developers |
| `Email not provided` | Permissions insuffisantes | Vérifiez les scopes demandés |

### Commandes utiles
```bash
# Démarrer le serveur dev
npm run dev

# Voir les logs en console (F12 dans le navigateur)
# Les messages commencent par ✅ (succès) ou ❌ (erreur)
```

---

## 📱 Structure des données reçues

### Google OAuth
```javascript
{
  email: "user@gmail.com",
  name: "John Doe",
  picture: "https://lh3.googleusercontent.com/...",
  provider: "google",
  oauth_id: "1234567890"
}
```

### Facebook OAuth
```javascript
{
  email: "user@facebook.com", // ou facebook_id si pas d'email
  name: "John Doe",
  picture: "https://graph.facebook.com/...",
  provider: "facebook",
  oauth_id: "9876543210"
}
```

---

## 🎯 Intégration dans le Backend

Votre backend reçoit ces données via l'endpoint POST `/api/auth/oauth` avec :
```javascript
{
  email: "...",
  name: "...",
  provider: "google" | "facebook",
  oauth_id: "...",
  picture: "..."
}
```

Le backend doit :
1. Vérifier si l'utilisateur existe
2. S'il existe : connecter
3. S'il n'existe pas : créer un nouvel utilisateur
4. Retourner le token JWT et les données utilisateur

---

## ✨ Prochaines étapes

1. ✅ Copiez le code `oauthService.js`
2. ✅ Ajoutez vos Client ID / App ID
3. ✅ Testez la connexion
4. ✅ Les pages `/Connexion` et `/Inscription` sont déjà prêtes
5. ✅ L'`authStore.js` gère automatiquement les redirections

**Vous êtes prêt ! 🚀**
