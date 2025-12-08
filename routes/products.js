
import db from '../config/database.js' // Assurez-vous que c'est le bon chemin
import {authenticateToken, isAdmin} from '../middleware/auth.js'
import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router();

// GET - Récupérer tous les produits
router.get('/', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products WHERE status = ? ORDER BY created_at DESC', ['active']);
    res.json(products || []);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer un nouveau produit (admin uniquement)
router.post('/',
  authenticateToken,
  isAdmin,
  [
    body('name').notEmpty().trim().withMessage('Le nom est requis'),
    body('description').notEmpty().trim().withMessage('La description est requise'),
    body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('image_url').isURL().withMessage('L\'URL de l\'image est invalide'),
    body('stock').isInt({ min: 0 }).withMessage('Le stock doit être un nombre entier positif'),
    body('category').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, image_url, stock, category } = req.body;

    try {
      const result = await db.run('INSERT INTO products (name, description, price, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?)', [name, description, price, image_url, stock, category]);
      const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// PUT - Mettre à jour un produit (admin uniquement)
router.put('/:id',
  authenticateToken,
  isAdmin,
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('image_url').optional().isURL(),
    body('stock').optional().isInt({ min: 0 }),
    body('category').optional().trim(),
    body('status').optional().isIn(['active', 'inactive', 'out_of_stock'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, image_url, stock, category, status } = req.body;
    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (description) { updates.push('description = ?'); values.push(description); }
    if (price !== undefined) { updates.push('price = ?'); values.push(price); }
    if (image_url) { updates.push('image_url = ?'); values.push(image_url); }
    if (stock !== undefined) { updates.push('stock = ?'); values.push(stock); }
    if (category) { updates.push('category = ?'); values.push(category); }
    if (status) { updates.push('status = ?'); values.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    values.push(req.params.id);

    try {
      const result = await db.run(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

      if (!result.changes || result.changes === 0) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

      const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);

      res.json(updatedProduct);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// DELETE - Supprimer un produit (admin uniquement)
router.delete('/:id',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const result = await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);

      if (!result.changes || result.changes === 0) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

      res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

export default router;