// File: backend/routes/orders.js
import db from '../config/database.js' // Assurez-vous que c'est le bon chemin
import {authenticateToken, isAdmin} from '../middleware/auth.js'
import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router();

// GET - Récupérer toutes les commandes (admin)
router.get('/',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const orders = await db.all('SELECT * FROM orders ORDER BY created_at DESC');
      const ordersWithItems = [];
      for (const o of (orders || [])) {
        const items = await db.all('SELECT id, product_id, product_name, quantity, price FROM order_items WHERE order_id = ?', [o.id]);
        ordersWithItems.push({ ...o, items: items || [] });
      }

      res.json(ordersWithItems);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// GET - Récupérer les commandes d'un utilisateur
router.get('/user/:userId',
  authenticateToken,
  async (req, res) => {
    try {
      const orders = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
      const ordersWithItems = [];
      for (const o of (orders || [])) {
        const items = await db.all('SELECT id, product_id, product_name, quantity, price FROM order_items WHERE order_id = ?', [o.id]);
        ordersWithItems.push({ ...o, items: items || [] });
      }

      res.json(ordersWithItems);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// POST - Créer une nouvelle commande
router.post('/',
  authenticateToken,
  [
    body('items').isArray().notEmpty().withMessage('Les items sont requis'),
    body('total').isFloat({ min: 0 }).withMessage('Le total est invalide'),
    body('shipping_address').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, total, shipping_address, payment_method } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Les items sont requis' });
      }

      try {
        const user = await db.get('SELECT name, email FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const orderId = 'CMD' + Date.now();

        const created = await db.transaction(async () => {
          await db.run('INSERT INTO orders (id, user_id, customer_name, customer_email, total, payment_method, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?)', [orderId, req.user.id, user.name, user.email, total, payment_method, shipping_address]);
          for (const it of items) {
            await db.run('INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)', [orderId, it.id, it.name || it.product_name || '', it.quantity, it.price]);
            await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [it.quantity, it.id]);
          }
        });

        const createdOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
        const orderItems = await db.all('SELECT id, product_id, product_name, quantity, price FROM order_items WHERE order_id = ?', [orderId]);
        createdOrder.items = orderItems || [];

        res.status(201).json(createdOrder);
      } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({ error: 'Erreur serveur' });
      }
  }
);

// PUT - Mettre à jour le statut d'une commande (admin)
router.put('/:id/status',
  authenticateToken,
  isAdmin,
  [
    body('status').isIn(['pending', 'completed', 'shipped', 'cancelled'])
  ],
  async (req, res) => {
    const { status } = req.body;

    try {
      const result = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
      res.json({ message: 'Statut mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// DELETE - Supprimer une commande (admin)
router.delete('/:id',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const result = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
      res.json({ message: 'Commande supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);
export default router;
