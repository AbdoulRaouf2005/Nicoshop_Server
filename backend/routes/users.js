import supabase from '../config/supabase.js'
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
      // Récupérer tous les utilisateurs
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role, created_at, status')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Enrichir avec les statistiques de commandes
      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          // Compter les commandes
          const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          // Calculer le total dépensé
          const { data: orders } = await supabase
            .from('orders')
            .select('total')
            .eq('user_id', user.id);

          const totalSpent = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            joined: user.created_at,
            status: user.status || 'active',
            totalOrders: totalOrders || 0,
            totalSpent: parseFloat(totalSpent) || 0
          };
        })
      );

      res.json(enrichedUsers);
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
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error || !user) {
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
      const { data, error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', req.params.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
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
      // Récupérer l'utilisateur à supprimer
      const { data: userToDelete, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.params.id)
        .single();

      if (fetchError || !userToDelete) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Compter le nombre d'admins
      const { count: adminCount, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (countError) throw countError;

      // Empêcher la suppression du dernier admin
      if (userToDelete.role === 'admin' && adminCount <= 1) {
        return res.status(403).json({ error: 'Impossible de supprimer le dernier administrateur' });
      }

      // Supprimer l'utilisateur
      const { data, error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', req.params.id)
        .select();

      if (deleteError) throw deleteError;

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// PUT - Mettre à jour le thème de l'utilisateur connecté
router.put('/me/theme',
  authenticateToken,
  async (req, res) => {
    const { theme } = req.body;
    
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({ error: 'Thème invalide' });
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ theme })
        .eq('id', req.user.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ message: 'Thème mis à jour', theme });
    } catch (err) {
      console.error('Erreur mise à jour thème:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// PUT - Mettre à jour la région de livraison de l'utilisateur connecté
router.put('/me/shipping',
  authenticateToken,
  [
    body('shipping_region').notEmpty().withMessage('La région de livraison est requise')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shipping_region } = req.body;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ shipping_region })
        .eq('id', req.user.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.json({ message: 'Région de livraison mise à jour', shipping_region });
    } catch (err) {
      console.error('Erreur mise à jour région de livraison:', err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

export default router;