const express = require('express');
const { 
  register, 
  login, 
  getUserProfile, 
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Rota de cadastro
router.post('/register', register);

// Rota de login
router.post('/login', login);


// Rota para obter perfil do usuário (protegida)
router.get('/profile', requireAuth, getUserProfile);

// Rota para verificar token (protegida)
router.get('/verify', requireAuth, (req, res) => {
  res.json({ 
    message: 'Token válido', 
    user: req.user 
  });
});

// Nova rota: Solicitar recuperação de senha
router.post('/forgot-password', forgotPassword);

// Nova rota: Redefinir senha
router.post('/reset-password', resetPassword);

module.exports = router;