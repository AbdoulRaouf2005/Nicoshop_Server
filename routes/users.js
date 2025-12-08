import db from '../config/database.js'
import { authenticateToken, isAdmin } from '../middleware/auth.js'
import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router();

// GET - Récupérer tous les utilisateurs (admin)
router.get('/',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const users = await db.all(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.role,
          u.created_at,
          u.status,
          (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as totalOrders,
          COALESCE((SELECT SUM(total) FROM orders o WHERE o.user_id = u.id), 0) as totalSpent
        FROM users u
        ORDER BY u.created_at DESC
      `);

      res.json(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        joined: u.created_at,
        status: u.status || 'active',
        totalOrders: parseInt(u.totalOrders) || 0,
        totalSpent: parseFloat(u.totalSpent) || 0
      })));
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// GET - Récupérer un utilisateur par ID (admin)
router.get('/:id',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      res.json(user);
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// PUT - Mettre à jour le statut d'un utilisateur (admin)
router.put('/:id/status',
  authenticateToken,
  isAdmin,
  [
    body('status').isIn(['active', 'suspended', 'banned']).withMessage('Statut invalide')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    try {
      const result = await db.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);

      if (!result.changes || result.changes === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ message: 'Statut mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// DELETE - Supprimer un utilisateur (admin)
router.delete('/:id',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      // Empêcher la suppression du dernier admin
      const adminCountRow = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
      const userToDelete = await db.get('SELECT role FROM users WHERE id = ?', [req.params.id]);

      if (!userToDelete) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      if (userToDelete.role === 'admin' && adminCountRow.count <= 1) {
        return res.status(403).json({ error: 'Impossible de supprimer le dernier administrateur' });
      }

      const result = await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);

      if (!result.changes || result.changes === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

export default router;
