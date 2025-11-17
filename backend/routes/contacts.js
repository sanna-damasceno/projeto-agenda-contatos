const express = require('express');
const { 
  getContacts, 
  createContact, 
  updateContact, 
  deleteContact,
  getContactById 
} = require('../controllers/contactController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas protegidas por autenticação
router.use(requireAuth);

// GET /api/contacts - Listar todos os contatos do usuário
router.get('/', getContacts);

// GET /api/contacts/:id - Buscar contato específico
router.get('/:id', getContactById);

// POST /api/contacts - Criar novo contato
router.post('/', createContact);

// PUT /api/contacts/:id - Atualizar contato
router.put('/:id', updateContact);

// DELETE /api/contacts/:id - Excluir contato
router.delete('/:id', deleteContact);

module.exports = router;