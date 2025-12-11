# 🚀 Guide Déploiement NicoShop - Render (Backend) + Netlify (Frontend)

## Architecture

```
Frontend (Netlify) ↔ Backend API (Render)
      ↓                    ↓
  dist/             PostgreSQL (Supabase)
```

---

## 📦 Étape 1: Préparer le Backend (Render + Supabase)

### 1.1 Créer une base de données Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet:
   - **Nom**: `nicoshop`
   - **Mot de passe BD**: Choisissez un mot de passe fort
   - **Région**: La plus proche de vos utilisateurs
3. Attendez la création (~2 min)
4. Dans **Settings → Database**, récupérez:
   - Host: `xxx.supabase.co`
   - Database: `postgres`
   - User: `postgres`
   - Password: (celle que vous avez définie)

### 1.2 Déployer le Backend sur Render

1. Allez sur [render.com](https://render.com)
2. Connectez-vous avec GitHub
3. Cliquez **"New" → "Web Service"**
4. Sélectionnez votre dépôt
5. Configurez:
   - **Name**: `nicoshop-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (pour tester) ou Paid (production)

### 1.3 Ajouter les variables d'environnement Render

Dans le panneau Render, allez à **Settings → Environment Variables** et ajoutez:

```
DB_HOST=your-supabase-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<your-supabase-password>
DB_SSL=true
JWT_SECRET=<generate-a-random-secret-key>
NODE_ENV=production
```

### 1.4 Initialiser la base de données

Une fois le déploiement réussi sur Render:

1. Rendez-vous à l'URL de votre service Render (ex: `https://nicoshop-backend.onrender.com`)
2. Testez l'endpoint `/health` (devrait retourner `{"status":"ok"}`)
3. Ensuite, exécutez localement pour initialiser les tables:
   ```bash
   export DB_HOST=your-supabase-project.supabase.co
   export DB_PORT=5432
   export DB_NAME=postgres
   export DB_USER=postgres
   export DB_PASSWORD=your-password
   export DB_SSL=true
   
   cd backend
   npm install
   npm run init-db
   ```

**Note**: Vous pouvez aussi utiliser une GitHub Action ou un script Render pour automatiser cela.

---

## 🎨 Étape 2: Préparer et Déployer le Frontend (Netlify)

### 2.1 Configurer le fichier `.env`

À la racine du projet, créez un fichier `.env`:

```
# Development
VITE_API_BASE_URL=http://localhost:3001/api

# Pour production, remplacez par:
# VITE_API_BASE_URL=https://nicoshop-backend.onrender.com/api
```

### 2.2 Déployer sur Netlify

#### Option A: Via l'interface Netlify (Recommandé)

1. Allez sur [netlify.com](https://netlify.com)
2. Connectez-vous avec GitHub
3. Cliquez **"Add new site" → "Import an existing project"**
4. Sélectionnez votre dépôt GitHub
5. Netlify devrait auto-détecter:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist/`
6. Cliquez **"Deploy"**

#### Option B: Via CLI Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter à Netlify
netlify login

# Déployer
netlify deploy --prod
```

### 2.3 Ajouter les variables d'environnement Netlify

1. Dans le panneau Netlify, allez à **Site Settings → Build & Deploy → Environment**
2. Ajoutez:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://nicoshop-backend.onrender.com/api` (remplacez par votre URL Render)

3. Déclenchez un redéploiement (Netlify détectera automatiquement les changements)

---

## 🧪 Tester l'intégration

### 1. Vérifier la santé du backend

```bash
curl https://nicoshop-backend.onrender.com/health
# Devrait retourner: {"status":"ok"}
```

### 2. Tester l'inscription

```bash
curl -X POST https://nicoshop-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 3. Accéder au frontend

Visitez votre URL Netlify (ex: `https://nicoshop.netlify.app`) et testez:
- Inscription
- Connexion
- Affichage des produits
- Ajouter aux favoris
- Créer une commande

---

## 🔄 Configuration automatique du domaine personnalisé

### Domaine personnalisé Netlify

1. Dans **Site Settings → Domain management**
2. Cliquez **"Add custom domain"**
3. Entrez votre domaine (ex: `nicoshop.com`)
4. Suivez les étapes pour configurer les DNS

### Domaine personnalisé Render

1. Dans le panneau Render, allez à **Settings → Custom Domains**
2. Entrez votre domaine (ex: `api.nicoshop.com`)
3. Configurez les DNS (CNAME ou A record)

---

## 📝 Variables d'environnement récapitulatif

### Backend (Render) - `.env`

```
DB_HOST=your-supabase.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=xxxxxxxxxxxx
DB_SSL=true
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Frontend (Netlify) - env var

```
VITE_API_BASE_URL=https://nicoshop-backend.onrender.com/api
```

---

## 🐛 Dépannage courant

### Erreur: "CORS not allowed"

→ Assurez-vous que le backend a configuré CORS correctement:
```javascript
app.use(cors({
  origin: ['https://nicoshop.netlify.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Erreur: "Cannot POST /api/auth/register"

→ Vérifiez que `VITE_API_BASE_URL` est correctement défini dans Netlify

### Backend démarre mais 503 Service Unavailable

→ Vérifiez les variables d'environnement Render et les logs (Render Dashboard → Logs)

### "Database connection failed"

→ Vérifiez que `DB_HOST`, `DB_USER`, `DB_PASSWORD` sont corrects dans Render

---

## ✨ Checklist de déploiement

- [ ] Créer compte Supabase et DB PostgreSQL
- [ ] Créer compte Render
- [ ] Déployer backend sur Render
- [ ] Initialiser les tables: `npm run init-db` (en local avec env vars)
- [ ] Vérifier `/health` endpoint
- [ ] Créer compte Netlify
- [ ] Connecter GitHub à Netlify
- [ ] Configurer `VITE_API_BASE_URL` dans Netlify
- [ ] Déployer frontend via Netlify
- [ ] Tester inscription/connexion
- [ ] Configurer domaines personnalisés (optionnel)
- [ ] Mettre en place HTTPS (automatique sur Netlify et Render)
- [ ] Activer les emails de notification pour les déploiements

---

## 🎯 URLs finales

- **Frontend**: `https://nicoshop.netlify.app` (ou votre domaine personnalisé)
- **Backend API**: `https://nicoshop-backend.onrender.com` (ou votre domaine personnalisé)
- **Supabase Dashboard**: `https://app.supabase.com`

---

## 📚 Ressources utiles

- [Netlify Docs](https://docs.netlify.com)
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

Bon déploiement! 🚀
