import db from '../config/database.js'
import express from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router();

// GET - Récupérer les favoris de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await db.all(
      'SELECT f.id, f.product_id, p.name, p.description, p.price, p.image_url FROM favoris f JOIN products p ON f.product_id = p.id WHERE f.user_id = ?',
      [req.user.id]
    );
    res.json(rows || []);
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Ajouter un favori
router.post('/', authenticateToken, async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ error: 'ID produit requis' });
  try {
    // Vérifier si déjà en favoris
    const exist = await db.get('SELECT id FROM favoris WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
    if (exist) return res.status(409).json({ error: 'Déjà en favoris' });
    await db.run('INSERT INTO favoris (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
    res.status(201).json({ message: 'Ajouté aux favoris' });
  } catch (error) {
    console.error('Erreur ajout favori:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer un favori
router.delete('/:product_id', authenticateToken, async (req, res) => {
  try {
    const result = await db.run('DELETE FROM favoris WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.product_id]);
    if (!result.changes || result.changes === 0) return res.status(404).json({ error: 'Favori non trouvé' });
    res.json({ message: 'Favori supprimé' });
  } catch (error) {
    console.error('Erreur suppression favori:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
