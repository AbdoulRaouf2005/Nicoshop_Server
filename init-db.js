import db from './config/database.js'

console.log('🗄️ Initialisation de la base de données SQLite...')

async function main() {
  try {
    // Table users
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        picture TEXT,
        status TEXT DEFAULT 'active',
        oauth_provider TEXT,
        oauth_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Table products
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        image TEXT,
        stock INTEGER DEFAULT 0,
        category TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Table orders
    await db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        total REAL NOT NULL,
        payment_method TEXT,
        shipping_address TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Table order_items
    await db.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    // Table favoris
    await db.exec(`
      CREATE TABLE IF NOT EXISTS favoris (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    console.log('✅ Tables créées avec succès')

    // Insérer un utilisateur admin par défaut
    const adminCheck = await db.get('SELECT id FROM users WHERE email = ?', ['admin@nicoshop.com'])
    if (!adminCheck) {
      await db.run(`
        INSERT INTO users (name, email, password, role, status)
        VALUES (?, ?, ?, ?, ?)
      `, ['Admin NicoShop', 'admin@nicoshop.com', '$2b$10$YhK8jVW.dqXqO8B0fSdwZeGhKPJEqmKjZqhJ2C9nJ8K7Z9vQ8kp.C', 'admin', 'active'])
      console.log('✅ Admin par défaut créé (email: admin@nicoshop.com, password: admin123)')
    }

    // Assurer la colonne 'theme' existe dans users
    try {
      const cols = await db.all("PRAGMA table_info('users')")
      const hasTheme = cols.some(c => c.name === 'theme')
      if (!hasTheme) {
        await db.run("ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'light'")
        console.log('✅ Colonne theme ajoutée à users')
      }
    } catch (err) {
      console.warn('Impossible de vérifier/ajouter la colonne theme:', err.message)
    }

    console.log('🎉 Base de données initialisée avec succès!')
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error.message)
    process.exit(1)
  }
}

main()
