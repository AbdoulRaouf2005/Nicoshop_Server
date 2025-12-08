# 🚀 Backend NicoShop - API REST

Backend Node.js + Express + MySQL pour l'application NicoShop.

## 📦 Installation

```bash
cd backend
npm install
```

## 🗄️ Configuration de la base de données

1. **Installer MySQL** (si ce n'est pas déjà fait)
```bash
# Sur Ubuntu/Debian
sudo apt install mysql-server

# Sur macOS (avec Homebrew)
brew install mysql

# Sur Windows
# Télécharger depuis https://dev.mysql.com/downloads/mysql/
```

2. **Démarrer MySQL**
```bash
# Sur Linux/macOS
sudo service mysql start

# Sur macOS (Homebrew)
brew services start mysql
```

3. **Se connecter à MySQL**
```bash
mysql -u root -p
```

4. **Exécuter le script SQL**
```sql
source config/init-db.sql
```

Ou copier-coller le contenu du fichier `init-db.sql` dans le terminal MySQL.

5. **Créer le mot de passe admin**
```bash
# Générer un hash bcrypt pour le mot de passe
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

Remplacer le hash dans le fichier SQL.

## ⚙️ Configuration

Créer un fichier `.env` à la racine du backend:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=nicoshop_db
JWT_SECRET=votre_secret_jwt_super_securise_ici_123456789
```

## 🚀 Démarrage

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 Routes API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un