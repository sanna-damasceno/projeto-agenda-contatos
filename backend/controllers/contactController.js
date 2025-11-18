const { Contact, User } = require('../models');

const getContacts = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Buscar contatos usando o Model
    const contacts = await Contact.findByUserId(userId);

    // Converter para formato do frontend
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      name: contact.nome,
      phone: contact.telefone,
      email: contact.email,
      notes: contact.observacoes,
      status: contact.situacao,
      createdAt: contact.data_criacao
    }));

    res.json(formattedContacts);
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({ error: 'Erro ao buscar contatos' });
  }
};

const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Buscar contato específico usando o Model
    const contact = await Contact.findById(id, userId);

    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    res.json({
      id: contact.id,
      name: contact.nome,
      phone: contact.telefone,
      email: contact.email,
      notes: contact.observacoes,
      status: contact.situacao,
      createdAt: contact.data_criacao
    });
  } catch (error) {
    console.error('Erro ao buscar contato:', error);
    res.status(500).json({ error: 'Erro ao buscar contato' });
  }
};

const createContact = async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    const userId = req.user.userId;

    // Validar campos obrigatórios
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se o contato é um usuário registrado usando o Model
    const userExists = await User.findByEmail(email);
    const status = userExists ? 'Registrado' : 'Não Registrado';

    // Criar contato usando o Model
    const contactId = await Contact.create({
      usuario_id: userId,
      nome: name.trim(),
      telefone: phone ? phone.trim() : null,
      email: email.trim(),
      observacoes: notes ? notes.trim() : null,
      situacao: status
    });

    res.status(201).json({
      message: 'Contato criado com sucesso',
      contact: { 
        id: contactId, 
        name, 
        phone, 
        email, 
        notes, 
        status 
      }
    });
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    res.status(500).json({ error: 'Erro ao criar contato' });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes, status } = req.body;
    const userId = req.user.userId;

    console.log('Dados recebidos para atualização:', { id, name, phone, email, notes, status });

    // Validar campos obrigatórios
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se o contato existe e pertence ao usuário
    const existingContact = await Contact.findById(id, userId);
    if (!existingContact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // Preparar dados para atualização
    const updateData = {
      nome: name.trim(),
      telefone: phone ? phone.trim() : null,
      email: email.trim(),
      observacoes: notes ? notes.trim() : null,
      situacao: status || 'Não Registrado'
    };

    console.log('Dados sanitizados:', updateData);

    // Atualizar contato usando o Model
    const updated = await Contact.update(id, updateData);
    
    if (!updated) {
      return res.status(500).json({ error: 'Erro ao atualizar contato' });
    }

    // Buscar contato atualizado
    const updatedContact = await Contact.findById(id);

    res.json({
      message: 'Contato atualizado com sucesso',
      contact: {
        id: updatedContact.id,
        name: updatedContact.nome,
        phone: updatedContact.telefone,
        email: updatedContact.email,
        notes: updatedContact.observacoes,
        status: updatedContact.situacao
      }
    });

  } catch (error) {
    console.error('Erro detalhado ao atualizar contato:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verificar se o contato existe e pertence ao usuário
    const contactExists = await Contact.findById(id, userId);
    if (!contactExists) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // Excluir contato usando o Model
    const deleted = await Contact.delete(id, userId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Erro ao excluir contato' });
    }

    res.json({ message: 'Contato excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir contato:', error);
    res.status(500).json({ error: 'Erro ao excluir contato' });
  }
};

module.exports = { 
  getContacts, 
  getContactById,
  createContact, 
  updateContact, 
  deleteContact
};