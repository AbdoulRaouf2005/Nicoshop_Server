# NicoShop Backend - API REST

Backend Node.js + Express + Supabase (PostgreSQL) pour l'application NicoShop.

## Stack

- **Runtime :** Node.js (ES Modules)
- **Framework :** Express 5
- **Base de données :** Supabase (PostgreSQL)
- **Auth :** JWT (jsonwebtoken) + bcrypt
- **Validation :** express-validator
- **Rate limiting :** Auth routes (10 req / 15 min)
- **Docs :** Swagger UI (swagger-ui-express)

---

## Installation

```bash
cd backend
npm install
```

## Configuration

Copier `.env.example` vers `.env` et remplir les valeurs :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_cle_anon
PORT=3001
JWT_SECRET=votre_secret_jwt
```

### Obtenir les identifiants Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Allez dans **Settings > API**
3. Copiez l'**URL** et la **anon public key** dans votre `.env`

### Base de données

Les tables nécessaires doivent exister dans Supabase :

- `users` (id, name, email, password, role, status, picture, oauth_provider, oauth_id, theme, shipping_region, created_at)
- `products` (id, name, description, price, image_url, stock, category, status, created_at)
- `orders` (id, user_id, customer_name, customer_email, total, status, payment_method, shipping_address, shipping_region, delivery_fee, currency, created_at)
- `order_items` (id, order_id, product_id, product_name, quantity, price)
- `favoris` (id, user_id, product_id)

---

## Démarrage

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3001`

---

## Documentation Swagger

Une fois le serveur lancé, ouvrez :

```
http://localhost:3001/api/docs/
```

L'interface Swagger UI permet de :
- Parcourir tous les endpoints
- Lire les schémas et paramètres
- Cliquer sur **Try it out** pour tester en direct
- S'authentifier via le bouton **Authorize** (coller le token JWT)

---

## Comptes de démo

Pour tester l'API, créez d'abord des comptes via `/api/auth/register`.

### Inscription client
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Client Test",
    "email": "client@test.com",
    "password": "123456"
  }'
```

### Inscription admin
Le rôle `admin` doit être défini manuellement dans Supabase (modifier le champ `role` de l'utilisateur de `customer` à `admin`).
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Test",
    "email": "admin@test.com",
    "password": "123456"
  }'
```

Puis dans Supabase, changez `role` de `"customer"` à `"admin"` pour ce compte.

### Connexion
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "123456"
  }'
```

La réponse contient un `token` JWT à utiliser pour les routes protégées.

---

## Flux d'utilisation typique

### 1. Consultation des produits (aucun auth requis)
```bash
curl http://localhost:3001/api/products
```

### 2. Inscription / Connexion
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "client@test.com", "password": "123456"}'
```
→ Récupérer le `token` de la réponse.

### 3. Ajouter un favori (token requis)
```bash
curl -X POST http://localhost:3001/api/favoris \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1}'
```

### 4. Passer une commande (token requis)
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": 1, "name": "Produit test", "quantity": 2, "price": 15.00}
    ],
    "total": 30.00,
    "shipping_region": "Douala",
    "delivery_fee": 2.50,
    "currency": "FCFA"
  }'
```

### 5. Administration (token admin requis)
```bash
# Lister les utilisateurs
curl http://localhost:3001/api/users \
  -H "Authorization: Bearer TOKEN_ADMIN"

# Modifier le statut d'une commande
curl -X PUT http://localhost:3001/api/orders/CMD-abc12345/status \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'

# Créer un produit
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nouveau produit",
    "description": "Description du produit",
    "price": 29.99,
    "image_url": "https://example.com/image.jpg",
    "stock": 100,
    "category": "Électronique"
  }'
```

---

## Routes API

### Authentification
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | ❌ | Inscription |
| POST | `/api/auth/login` | ❌ | Connexion |
| POST | `/api/auth/oauth` | ❌ | Connexion OAuth (Google/Facebook) |

### Produits
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/products` | ❌ | Liste des produits actifs |
| GET | `/api/products/:id` | ❌ | Détail d'un produit |
| POST | `/api/products` | ✅ admin | Créer un produit |
| PUT | `/api/products/:id` | ✅ admin | Modifier un produit |
| DELETE | `/api/products/:id` | ✅ admin | Supprimer un produit |

### Commandes
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/orders` | ✅ admin | Toutes les commandes |
| GET | `/api/orders/user/:userId` | ✅ | Commandes d'un utilisateur |
| POST | `/api/orders` | ✅ | Créer une commande |
| PUT | `/api/orders/:id/status` | ✅ admin | Modifier le statut |
| DELETE | `/api/orders/:id` | ✅ admin | Supprimer une commande |

### Favoris
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/favoris` | ✅ | Favoris de l'utilisateur connecté |
| POST | `/api/favoris` | ✅ | Ajouter un favori |
| DELETE | `/api/favoris/:product_id` | ✅ | Supprimer un favori |

### Utilisateurs
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/users` | ✅ admin | Lister les utilisateurs |
| GET | `/api/users/:id` | ✅ admin | Détail d'un utilisateur |
| PUT | `/api/users/:id/status` | ✅ admin | Changer le statut |
| DELETE | `/api/users/:id` | ✅ admin | Supprimer un utilisateur |
| PUT | `/api/users/me/theme` | ✅ | Changer le thème (light/dark) |
| PUT | `/api/users/me/shipping` | ✅ | Changer la région de livraison |

---

## Sécurité

- Les mots de passe sont hachés avec **bcrypt** (10 rounds)
- Authentification par **JWT** (durée : 30 min)
- Rate limiting sur `/api/auth/*` : 10 tentatives par fenêtre de 15 minutes
- Routes sensibles protégées par middleware `authenticateToken` et `isAdmin`
- Les clés API (.env) sont exclues de git via `.gitignore`
