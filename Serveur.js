import cors from 'cors'
import { readFileSync } from 'fs'
import authRoutes from './routes/auth.js'
import productsRoutes from './routes/products.js'
import ordersRoutes from './routes/orders.js'
import favorisRoutes from './routes/favoris.js'
import usersRoutes from './routes/users.js'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/favoris', favorisRoutes);
app.use('/api/users', usersRoutes);

// Documentation Swagger
const swaggerSpec = JSON.parse(readFileSync('./docs/swagger.json', 'utf-8'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});



app.listen(PORT, () => {
  console.log(`🚀 Serveur NicoShop démarré sur le port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
});
