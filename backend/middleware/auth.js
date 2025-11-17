const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const requireAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Acesso negado. Token necessário.' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo');
    
    // Verificar se usuário ainda existe no banco
    const [users] = await pool.execute(
      'SELECT id, nome, email FROM usuarios WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Token inválido. Usuário não encontrado.' });
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: users[0].nome
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }
    res.status(500).json({ error: 'Erro de autenticação.' });
  }
};

module.exports = { requireAuth };