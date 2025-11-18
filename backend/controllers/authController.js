const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Contact } = require('../models');

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Verificar se usuário já existe usando o Model
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criar usuário usando o Model
    const userId = await User.create({ name, email, phone, password });

    // Atualizar situação dos contatos existentes
    await User.markContactsAsUnregistered(email, userId);

    // Gerar token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'seu_segredo',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: { id: userId, name, email, phone }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário usando o Model
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.senha);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'seu_segredo',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: { 
        id: user.id, 
        name: user.nome, 
        email: user.email, 
        phone: user.telefone 
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('Buscando perfil do usuário ID:', userId);

    // Buscar usuário usando o Model
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const userId = req.user.userId;

    console.log('Atualizando perfil do usuário ID:', userId, 'Dados:', { name, phone, avatar_url });
    
    // Validar dados
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Verificar se usuário existe usando o Model
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar usuário usando o Model
    const updateData = { name: name.trim(), phone, avatar_url };
    const updated = await User.update(userId, updateData);
    
    if (!updated) {
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }

    // Buscar usuário atualizado
    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar_url: updatedUser.avatar_url,
        created_at: updatedUser.created_at
      },
      message: 'Perfil atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Excluir conta do usuário
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log('Excluindo conta do usuário ID:', userId);

    // Verificar se usuário existe e pegar o email usando o Model
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userEmail = user.email;

    // Iniciar transação para garantir consistência
    const pool = require('../config/database');
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. PRIMEIRO: Atualizar a situação dos contatos em OUTRAS agendas
      const updatedContacts = await User.markContactsAsUnregistered(userEmail, userId);
      console.log(`Contatos com email ${userEmail} atualizados para "Não Registrado" em outras agendas: ${updatedContacts}`);

      // 2. SEGUNDO: Excluir todos os contatos do próprio usuário
      const deletedContacts = await Contact.deleteAllByUserId(userId);
      console.log(`Contatos do usuário excluídos: ${deletedContacts}`);

      // 3. TERCEIRO: Excluir o usuário
      const userDeleted = await User.delete(userId);
      if (!userDeleted) {
        throw new Error('Erro ao excluir usuário');
      }

      await connection.commit();
      
      console.log(`Conta do usuário ID: ${userId} excluída com sucesso`);
      console.log(`Email ${userEmail} marcado como "Não Registrado" em outras agendas`);

      res.json({
        success: true,
        message: 'Conta excluída com sucesso'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Solicitar recuperação de senha
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar se o usuário existe usando o Model
    const user = await User.findByEmail(email);

    // SEMPRE retornar sucesso (por segurança não revelar se email existe)
    if (!user) {
      // Mas internamente não faz nada
      console.log(`Tentativa de recuperação para email não cadastrado: ${email}`);
      return res.json({ 
        message: 'Se o email estiver cadastrado, você receberá instruções de recuperação' 
      });
    }
    
    // Gerar token de recuperação (válido por 1 hora)
    const resetToken = jwt.sign(
      { userId: user.id, email, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Em produção, aqui você enviaria um email real
    console.log('=== RECUPERAÇÃO DE SENHA SOLICITADA ===');
    console.log(`Usuário: ${user.nome}`);
    console.log(`Email: ${email}`);
    console.log(`Token de recuperação: ${resetToken}`);
    console.log(`Link de recuperação: http://localhost:3000/redefinir-senha?token=${resetToken}`);
    console.log('========================================');

    res.json({ 
      message: 'Se o email estiver cadastrado, você receberá instruções de recuperação',
      // Em desenvolvimento, retornamos o token para teste
      debugToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Redefinir senha
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Token inválido' });
    }

    // Atualizar senha usando o Model
    const passwordUpdated = await User.updatePassword(decoded.userId, newPassword);
    
    if (!passwordUpdated) {
      return res.status(500).json({ error: 'Erro ao redefinir senha' });
    }

    console.log(`Senha redefinida para usuário ID: ${decoded.userId}`);

    res.json({ 
      message: 'Senha redefinida com sucesso!',
      redirectTo: '/login'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token expirado. Solicite uma nova recuperação.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Token inválido' });
    }
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { 
  register, 
  login,
  getUserProfile,    
  updateProfile, 
  deleteAccount,    
  forgotPassword,  
  resetPassword     
};