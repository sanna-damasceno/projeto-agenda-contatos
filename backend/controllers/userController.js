
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const userId = req.user.userId;

    console.log('Atualizando perfil:', { userId, name, phone, avatar_url });

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
      'UPDATE usuarios SET nome = ?, telefone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name.trim(), phone, avatar_url, userId]
    );

    // Buscar usuário atualizado
    const [updatedUsers] = await pool.execute(
      `SELECT id, nome as name, email, telefone as phone, avatar_url, data_criacao as created_at, updated_at 
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
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
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

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.execute(
      `SELECT id, nome as name, email, telefone as phone, avatar_url, data_criacao as created_at, updated_at 
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
        created_at: user.created_at,
        updated_at: user.updated_at
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