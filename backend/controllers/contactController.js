const pool = require('../config/database');

const getContacts = async (req, res) => {
  try {
    const [contacts] = await pool.execute(
      'SELECT * FROM contatos WHERE usuario_id = ? ORDER BY nome',
      [req.user.userId]
    );

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

    const [contacts] = await pool.execute(
      'SELECT * FROM contatos WHERE id = ? AND usuario_id = ?',
      [id, req.user.userId]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    const contact = contacts[0];
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

     if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se o contato é um usuário registrado
    const [existingUsers] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    // Definir situação automaticamente
    const status = existingUsers.length > 0 ? 'Registrado' : 'Não Registrado';

    const telefoneValue = phone && phone.trim() !== '' ? phone.trim() : null;

    // Inserir contato
    const [result] = await pool.execute(
      'INSERT INTO contatos (usuario_id, nome, telefone, email, observacoes, situacao) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, phone, email, notes, status]
    );

    res.status(201).json({
      message: 'Contato criado com sucesso',
      contact: { 
        id: result.insertId, 
        name, phone, email, notes, 
        status 
      }
    });
  } catch (error) {
    console.error('Erro ao criar contato:', error);
    res.status(500).json({ error: 'Erro ao criar contato' });
  }
};

// controllers/contactController.js - VERSÃO ROBUSTA
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes, status } = req.body;

    console.log('Dados recebidos para atualização:', { id, name, phone, email, notes, status });

    // Validar campos obrigatórios
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se o contato existe
    const [contacts] = await pool.execute(
      'SELECT * FROM contatos WHERE id = ?',
      [id]
    );

    if (contacts.length === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    const telefoneValue = phone && phone.trim() !== '' ? phone.trim() : null;

    // Preparar valores para o banco (evitar undefined)
    const updateData = {
      nome: name.trim(),
      telefone: phone.trim(),
      email: email ? email.trim() : null,
      observacoes: notes ? notes.trim() : null,
      situacao: status || 'Não Registrado'
    };

    console.log('Dados sanitizados:', updateData);

    // Atualizar contato
    const [result] = await pool.execute(
      `UPDATE contatos 
       SET nome = ?, telefone = ?, email = ?, observacoes = ?, situacao = ?
       WHERE id = ?`,
      [
        updateData.nome,
        updateData.telefone,
        updateData.email,
        updateData.observacoes,
        updateData.situacao,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // Buscar contato atualizado
    const [updatedContacts] = await pool.execute(
      'SELECT * FROM contatos WHERE id = ?',
      [id]
    );

    const updatedContact = updatedContacts[0];

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

    // Verificar se o contato pertence ao usuário
    const [userContacts] = await pool.execute(
      'SELECT id FROM contatos WHERE id = ? AND usuario_id = ?',
      [id, req.user.userId]
    );

    if (userContacts.length === 0) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    await pool.execute('DELETE FROM contatos WHERE id = ?', [id]);

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