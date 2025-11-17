const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Verificar se usuário já existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir usuário
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, telefone, senha) VALUES (?, ?, ?, ?)',
      [name, email, phone, hashedPassword]
    );

    // Atualizar situação dos contatos existentes
    await pool.execute(
      'UPDATE contatos SET situacao = "Registrado" WHERE email = ?',
      [email]
    );

    // Gerar token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'seu_segredo',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: { id: result.insertId, name, email, phone }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];

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

  // Verificar se vai ser preciso...
  const getUserProfile = async (req, res) => {
    try {
      const userId = req.user.userId;

      console.log('Buscando perfil do usuário ID:', userId);

      const [users] = await pool.execute(
        `SELECT id, nome as name, email, telefone as phone, avatar_url, data_criacao as created_at 
        FROM usuarios WHERE id = ?`,
        [userId]
      );
      if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const user = users[0];

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

    // Verificar se usuário existe
    const [users] = await pool.execute(
      'SELECT id FROM usuarios WHERE id = ?',
      [userId]
    );

     if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar no banco
    await pool.execute(
      'UPDATE usuarios SET nome = ?, telefone = ?, avatar_url = ? WHERE id = ?',
      [name.trim(), phone, avatar_url, userId]
    );

    // Buscar usuário atualizado
    const [updatedUsers] = await pool.execute(
      `SELECT id, nome as name, email, telefone as phone, avatar_url, data_criacao as created_at 
       FROM usuarios WHERE id = ?`,
      [userId]
    );

    const updatedUser = updatedUsers[0];

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

    // Verificar se usuário existe e pegar o email
    const [users] = await pool.execute(
      'SELECT id, email FROM usuarios WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userEmail = users[0].email;

    // Iniciar transação para garantir consistência
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. PRIMEIRO: Atualizar a situação dos contatos em OUTRAS agendas
      // Para todos os contatos de outros usuários que tinham este email, mudar para "Não Registrado"
      await connection.execute(
        'UPDATE contatos SET situacao = "Não Registrado" WHERE email = ? AND usuario_id != ?',
        [userEmail, userId]
      );

      console.log(`Contatos com email ${userEmail} atualizados para "Não Registrado" em outras agendas`);

      // 2. SEGUNDO: Excluir todos os contatos do próprio usuário
      await connection.execute(
        'DELETE FROM contatos WHERE usuario_id = ?',
        [userId]
      );

      // 3. TERCEIRO: Excluir o usuário
      await connection.execute(
        'DELETE FROM usuarios WHERE id = ?',
        [userId]
      );

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

    // Verificar se o usuário existe
    const [users] = await pool.execute(
      'SELECT id, nome FROM usuarios WHERE email = ?',
      [email]
    );

    // SEMPRE retornar sucesso (por segurança não revelar se email existe)
    if (users.length === 0) {
      // Mas internamente não faz nada
      console.log(`Tentativa de recuperação para email não cadastrado: ${email}`);
      return res.json({ 
        message: 'Se o email estiver cadastrado, você receberá instruções de recuperação' 
      });
    }

    const user = users[0];
    
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

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha no banco
    await pool.execute(
      'UPDATE usuarios SET senha = ? WHERE id = ?',
      [hashedPassword, decoded.userId]
    );

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

