const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Buscar usuário por ID
  static async findById(id) {
    try {
      const [users] = await pool.execute(
        `SELECT id, nome as name, email, telefone as phone, avatar_url, 
                data_criacao as created_at, updated_at 
         FROM usuarios WHERE id = ?`,
        [id]
      );
      return users[0];
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  // Buscar usuário por email
  static async findByEmail(email) {
    try {
      const [users] = await pool.execute(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
      );
      return users[0];
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }
  }

  // Criar novo usuário
  static async create(userData) {
    try {
      const { name, email, phone, password } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.execute(
        'INSERT INTO usuarios (nome, email, telefone, senha) VALUES (?, ?, ?, ?)',
        [name, email, phone, hashedPassword]
      );

      return result.insertId;
    } catch (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  // Atualizar usuário
  static async update(id, userData) {
    try {
      const { name, phone, avatar_url } = userData;
      
      const [result] = await pool.execute(
        'UPDATE usuarios SET nome = ?, telefone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, phone, avatar_url, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  // Excluir usuário
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM usuarios WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erro ao excluir usuário: ${error.message}`);
    }
  }

  // Verificar se email já existe
  static async emailExists(email) {
    try {
      const [users] = await pool.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );
      return users.length > 0;
    } catch (error) {
      throw new Error(`Erro ao verificar email: ${error.message}`);
    }
  }

  // Atualizar senha
  static async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const [result] = await pool.execute(
        'UPDATE usuarios SET senha = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erro ao atualizar senha: ${error.message}`);
    }
  }

  // Marcar contatos como "Não Registrado" quando usuário é excluído
  static async markContactsAsUnregistered(email, excludedUserId) {
    try {
      const [result] = await pool.execute(
        'UPDATE contatos SET situacao = "Não Registrado" WHERE email = ? AND usuario_id != ?',
        [email, excludedUserId]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Erro ao atualizar contatos: ${error.message}`);
    }
  }
}

module.exports = User;