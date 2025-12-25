import supabase from '../config/supabase.js'
import express from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router();

// GET - Récupérer les favoris de l'utilisateur
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: favoris, error } = await supabase
      .from('favoris')
      .select(`
        id,
        product_id,
        products (
          name,
          description,
          price,
          image_url
        )
      `)
      .eq('user_id', req.user.id);

    if (error) throw error;

    // Reformater les données pour correspondre à l'ancien format
    const formattedFavoris = favoris.map(fav => ({
      id: fav.id,
      product_id: fav.product_id,
      name: fav.products.name,
      description: fav.products.description,
      price: fav.products.price,
      image_url: fav.products.image_url
    }));

    res.json(formattedFavoris);
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Ajouter un favori
router.post('/', authenticateToken, async (req, res) => {
  const { product_id } = req.body;
  
  if (!product_id) {
    return res.status(400).json({ error: 'ID produit requis' });
  }

  try {
    // Vérifier si déjà en favoris
    const { data: existing, error: checkError } = await supabase
      .from('favoris')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Déjà en favoris' });
    }

    // Ajouter aux favoris
    const { data, error: insertError } = await supabase
      .from('favoris')
      .insert([{ user_id: req.user.id, product_id }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: 'Ajouté aux favoris', favori: data });
  } catch (error) {
    console.error('Erreur ajout favori:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer un favori
router.delete('/:product_id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('favoris')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', req.params.product_id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Favori non trouvé' });
    }

    res.json({ message: 'Favori supprimé' });
  } catch (error) {
    console.error('Erreur suppression favori:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;