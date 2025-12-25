import supabase from '../config/supabase.js'
import { authenticateToken, isAdmin } from '../middleware/auth.js'
import express from 'express'
import { body, validationResult } from 'express-validator'

const router = express.Router();

// GET - Récupérer tous les produits
router.get('/', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(products || []);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
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
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([{
          name,
          description,
          price,
          image_url,
          stock,
          category
        }])
        .select()
        .single();

      if (error) throw error;

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
    
    // Construire l'objet de mise à jour avec uniquement les champs fournis
    const updates = {};
    
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (image_url !== undefined) updates.image_url = image_url;
    if (stock !== undefined) updates.stock = stock;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    try {
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error || !updatedProduct) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

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
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
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