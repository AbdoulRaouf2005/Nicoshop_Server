import supabase from '../config/supabase.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import express from 'express'
import { body, validationResult } from 'express-validator'

const MySecret = process.env.JWT_SECRET

const router = express.Router();

// POST - Inscription
router.post('/register',
  [
    body('name').notEmpty().trim().withMessage('Le nom est requis'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      // Vérifier si l'email existe déjà
      const { data: existing, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer le nouvel utilisateur
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ name, email, password: hashedPassword, role: 'customer' }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Générer le token JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: 'customer' }, 
        MySecret, 
        { expiresIn: '1800s' }
      );

      res.status(201).json({ 
        message: 'Inscription réussie', 
        token, 
        user: { 
          id: newUser.id, 
          name: newUser.name, 
          email: newUser.email, 
          role: newUser.role 
        } 
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// POST - Connexion
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      // Récupérer l'utilisateur par email
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError || !user) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Vérifier le mot de passe
      const validPassword = await bcrypt.compare(password, user.password || '');
      if (!validPassword) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        MySecret, 
        { expiresIn: '1800s' }
      );

      res.json({ 
        message: 'Connexion réussie', 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          picture: user.picture 
        } 
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// POST - Connexion/Inscription OAuth (Google, Facebook)
router.post('/oauth',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').notEmpty().trim(),
    body('provider').isIn(['google', 'facebook']),
    body('oauth_id').notEmpty(),
    body('picture').optional().isURL()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, name, provider, oauth_id, picture } = req.body;
    try {
      // Chercher l'utilisateur existant par email ou oauth_id
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${email},and(oauth_provider.eq.${provider},oauth_id.eq.${oauth_id})`);

      let user = users && users.length > 0 ? users[0] : null;

      if (user) {
        // Mettre à jour la photo si nécessaire
        if (picture && picture !== user.picture) {
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ picture })
            .eq('id', user.id)
            .select()
            .single();

          if (!updateError) {
            user.picture = picture;
          }
        }
      } else {
        // Créer un nouvel utilisateur
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            name,
            email,
            password: '',
            oauth_provider: provider,
            oauth_id,
            picture,
            role: 'customer'
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        user = newUser;
      }

      // Générer le token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        MySecret, 
        { expiresIn: '1800s' }
      );

      res.json({ 
        message: 'Connexion OAuth réussie', 
        token, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          picture: user.picture 
        } 
      });
    } catch (error) {
      console.error('Erreur OAuth:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

export default router;