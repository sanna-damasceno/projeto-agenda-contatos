const { User } = require('../models');

const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const userId = req.user.userId;

    console.log('Atualizando perfil:', { userId, name, phone, avatar_url });

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
    const updateData = { 
      name: name.trim(), 
      phone, 
      avatar_url 
    };
    
    const updated = await User.update(userId, updateData);
    
    if (!updated) {
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }

    // Buscar usuário atualizado usando o Model
    const updatedUser = await User.findById(userId);

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

module.exports = {
  updateProfile,
  getUserProfile
};