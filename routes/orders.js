// File: backend/routes/orders.js
import supabase from '../config/supabase.js'
import { authenticateToken, isAdmin } from '../middleware/auth.js'
import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router();

// GET - Récupérer toutes les commandes (admin)
router.get('/',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Reformater pour correspondre à l'ancien format
      const ordersWithItems = orders.map(order => ({
        ...order,
        items: order.order_items || []
      }));

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
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            price
          )
        `)
        .eq('user_id', req.params.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Reformater pour correspondre à l'ancien format
      const ordersWithItems = orders.map(order => ({
        ...order,
        items: order.order_items || []
      }));

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
    body('shipping_address').optional().trim(),
    body('shipping_region').optional().trim(),
    body('delivery_fee').optional().isFloat({ min: 0 }).withMessage('Frais de livraison invalides'),
    body('currency').optional().isIn(['FCFA', 'EUR', 'USD']).withMessage('Devise invalide')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, total, shipping_address, shipping_region, delivery_fee, payment_method, currency } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Les items sont requis' });
    }

    try {
      // Récupérer les infos utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', req.user.id)
        .single();

      if (userError || !user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const orderId = 'CMD' + Date.now();

      // Créer la commande
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          id: orderId,
          user_id: req.user.id,
          customer_name: user.name,
          customer_email: user.email,
          total,
          payment_method,
          shipping_address: shipping_region || shipping_address || '',
          shipping_region: shipping_region || '',
          delivery_fee: delivery_fee ?? 0,
          currency: currency || 'FCFA'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insérer les items de commande
      const orderItemsData = items.map(it => ({
        order_id: orderId,
        product_id: it.id,
        product_name: it.name || it.product_name || '',
        quantity: it.quantity,
        price: it.price
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)
        .select();

      if (itemsError) throw itemsError;

      // Mettre à jour le stock des produits
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          product_id: item.id,
          quantity_to_subtract: item.quantity
        });

        // Si la fonction RPC n'existe pas, utiliser une approche alternative
        if (stockError) {
          // Récupérer le stock actuel
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.id)
            .single();

          if (product) {
            // Mettre à jour le stock
            await supabase
              .from('products')
              .update({ stock: product.stock - item.quantity })
              .eq('id', item.id);
          }
        }
      }

      // Récupérer la commande complète avec ses items
      const { data: createdOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            price
          )
        `)
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      // Reformater la réponse
      const responseOrder = {
        ...createdOrder,
        items: createdOrder.order_items || []
      };

      res.status(201).json(responseOrder);
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
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', req.params.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
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
      // Supprimer d'abord les items de commande (si pas de CASCADE)
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', req.params.id);

      // Supprimer la commande
      const { data, error } = await supabase
        .from('orders')
        .delete()
        .eq('id', req.params.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
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