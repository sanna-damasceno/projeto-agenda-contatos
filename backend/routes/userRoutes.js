// routes/userRoutes.js
const express = require('express');
const { 
  getUserProfile,
  updateProfile,
  deleteAccount

} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas protegidas por autenticação
router.use(requireAuth);

// GET /api/user/profile - Buscar perfil do usuário
router.get('/profile', getUserProfile);

// PUT /api/user/profile - Atualizar perfil do usuário
router.put('/profile', updateProfile);

// DELETE /api/user/account - Excluir conta permanentemente
router.delete('/account', deleteAccount);


module.exports = router;