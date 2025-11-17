const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const userRoutes = require('./routes/userRoutes'); // ← ADICIONE ESTA LINHA

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/user', userRoutes); // ← ADICIONE ESTA LINHA

// Rota de teste SIMPLES para verificar se está funcionando
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor rodando normalmente',
    timestamp: new Date().toISOString()
  });
});

// Rota básica
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bem-vindo à API da Agenda de Contatos!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      contacts: '/api/contacts',
      user: '/api/user',
      health: '/api/health'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Acesse: http://localhost:${PORT}/api/health`);
  console.log(`🏠 Página inicial: http://localhost:${PORT}/`);
  console.log(`👤 Rotas de usuário: http://localhost:${PORT}/api/user/profile`);
});