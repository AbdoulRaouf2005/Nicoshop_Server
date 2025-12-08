// Overwritten with a single clean auth implementation
import db from '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import express from 'express'
import { body, validationResult } from 'express-validator'

const MySecret = 'PYToiuygthèyO98uyh!7YTRtyi§ukygjhgkBUJytcèuyhj'

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
      const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
      if (existing) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

      const token = jwt.sign({ id: result.lastID, email, role: 'customer' }, MySecret, { expiresIn: '1800s' });

      res.status(201).json({ message: 'Inscription réussie', token, user: { id: result.lastID, name, email, role: 'customer' } });
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
      const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

      const validPassword = await bcrypt.compare(password, user.password || '');
      if (!validPassword) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, MySecret, { expiresIn: '1800s' });

      res.json({ message: 'Connexion réussie', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, picture: user.picture } });
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
      let user = await db.get('SELECT * FROM users WHERE email = ? OR (oauth_provider = ? AND oauth_id = ?)', [email, provider, oauth_id]);

      if (user) {
        if (picture && picture !== user.picture) {
          await db.run('UPDATE users SET picture = ? WHERE id = ?', [picture, user.id]);
          user.picture = picture;
        }
      } else {
        const result = await db.run('INSERT INTO users (name, email, password, oauth_provider, oauth_id, picture, role) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, email, '', provider, oauth_id, picture, 'customer']);
        user = { id: result.lastID, name, email, role: 'customer', picture, oauth_provider: provider, oauth_id };
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, MySecret, { expiresIn: '1800s' });
      res.json({ message: 'Connexion OAuth réussie', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, picture: user.picture } });
    } catch (error) {
      console.error('Erreur OAuth:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

export default router;

