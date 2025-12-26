/**
 * Service API pour communiquer avec le backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Récupérer le token du localStorage
const getToken = () => {
  return sessionStorage.getItem('auth_token');
};

// Headers par défaut
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Gérer les erreurs de réponse
const handleResponse = async (response) => {
  // Certains endpoints retournent 204 No Content, gérer cela
  let data = null
  try {
    if (response.status !== 204) {
      data = await response.json();
    }
  } catch (err) {
    data = null
  }

  if (!response.ok) {
    // Gestion spéciale pour 401/403 (non authentifié ou accès refusé)
    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_data');
      window.location.href = '/connexion';
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
    const message = data && (data.error || data.message) ? (data.error || data.message) : 'Erreur serveur'
    throw new Error(message);
  }

  return data;
};

// ============================================
// AUTHENTIFICATION
// ============================================
export const authAPI = {
  /**
   * Inscription classique
   */
  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse(response);
  },

  /**
   * Connexion classique
   */
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  /**
   * ⭐ NOUVEAU : Connexion/Inscription OAuth
   */
  async oauth(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/oauth`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  }
};

// ============================================
// PRODUITS
// ============================================
export const productsAPI = {
  /**
   * Récupérer tous les produits
   */
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    return handleResponse(response);
  },

  /**
   * Récupérer un produit par ID
   */
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: getHeaders(false)
    });
    return handleResponse(response);
  },

  /**
   * Créer un produit (admin)
   */
  async create(productData) {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  /**
   * Mettre à jour un produit (admin)
   */
  async update(id, productData) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(productData)
    });
    return handleResponse(response);
  },

  /**
   * Supprimer un produit (admin)
   */
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(response);
  }
};

// ============================================
// COMMANDES
// ============================================
export const ordersAPI = {
  /**
   * Récupérer toutes les commandes (admin)
   */
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: getHeaders(true)
    });
    return handleResponse(response);
  },

  /**
   * Récupérer les commandes d'un utilisateur
   */
  async getUserOrders(userId) {
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
      method: 'GET',
      headers: getHeaders(true)
    });
    return handleResponse(response);
  },

  /**
   * Créer une commande
   */
  async create(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },

  /**
   * Mettre à jour le statut (admin)
   */
  async updateStatus(orderId, status) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  /**
   * Supprimer une commande (admin)
   */
  async delete(orderId) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return handleResponse(response);
  }
};

// ============================================
// Utilitaires
// ============================================

/**
 * Sauvegarder le token
 */
export const saveToken = (token) => {
  sessionStorage.setItem('auth_token', token);
};

/**
 * Supprimer le token
 */
export const removeToken = () => {
  sessionStorage.removeItem('auth_token');
};

/**
 * Vérifier si un token existe
 */
export const hasToken = () => {
  return !!getToken();
};

// ============================================
// UTILISATEURS (admin)
// ============================================
export const usersAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getHeaders(true)
    })
    return handleResponse(response)
  },

  async updateStatus(userId, status) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    })
    return handleResponse(response)
  },

  async delete(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    })
    return handleResponse(response)
  },

  // Mettre à jour le thème (utilisateur connecté)
  async updateTheme(theme) {
    const response = await fetch(`${API_BASE_URL}/users/me/theme`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ theme })
    })
    return handleResponse(response)
  },

  // Mettre à jour la région de livraison (utilisateur connecté)
  async updateShippingRegion(shipping_region) {
    const response = await fetch(`${API_BASE_URL}/users/me/shipping`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ shipping_region })
    })
    return handleResponse(response)
  }
}
