const pool = require('../config/database');

class Contact {
  // Buscar todos os contatos de um usuário
  static async findByUserId(userId) {
    try {
      const [contacts] = await pool.execute(
        'SELECT * FROM contatos WHERE usuario_id = ? ORDER BY nome',
        [userId]
      );
      return contacts;
    } catch (error) {
      throw new Error(`Erro ao buscar contatos: ${error.message}`);
    }
  }

  // Buscar contato por ID
  static async findById(id, userId = null) {
    try {
      let query = 'SELECT * FROM contatos WHERE id = ?';
      const params = [id];

      if (userId) {
        query += ' AND usuario_id = ?';
        params.push(userId);
      }

      const [contacts] = await pool.execute(query, params);
      return contacts[0];
    } catch (error) {
      throw new Error(`Erro ao buscar contato: ${error.message}`);
    }
  }

  // Criar novo contato
  static async create(contactData) {
    try {
      const { usuario_id, nome, telefone, email, observacoes, situacao } = contactData;
      
      const [result] = await pool.execute(
        'INSERT INTO contatos (usuario_id, nome, telefone, email, observacoes, situacao) VALUES (?, ?, ?, ?, ?, ?)',
        [usuario_id, nome, telefone, email, observacoes, situacao]
      );

      return result.insertId;
    } catch (error) {
      throw new Error(`Erro ao criar contato: ${error.message}`);
    }
  }

  // Atualizar contato
  static async update(id, contactData) {
    try {
      const { nome, telefone, email, observacoes, situacao } = contactData;
      
      const [result] = await pool.execute(
        `UPDATE contatos 
         SET nome = ?, telefone = ?, email = ?, observacoes = ?, situacao = ?
         WHERE id = ?`,
        [nome, telefone, email, observacoes, situacao, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erro ao atualizar contato: ${error.message}`);
    }
  }

  // Excluir contato
  static async delete(id, userId = null) {
    try {
      let query = 'DELETE FROM contatos WHERE id = ?';
      const params = [id];

      if (userId) {
        query += ' AND usuario_id = ?';
        params.push(userId);
      }

      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Erro ao excluir contato: ${error.message}`);
    }
  }

  // Verificar se usuário existe pelo email (para definir situação)
  static async checkUserExistsByEmail(email) {
    try {
      const [users] = await pool.execute(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );
      return users.length > 0;
    } catch (error) {
      throw new Error(`Erro ao verificar usuário: ${error.message}`);
    }
  }

  // Buscar contatos com filtros
  static async findWithFilters(userId, filters = {}) {
    try {
      let query = 'SELECT * FROM contatos WHERE usuario_id = ?';
      const params = [userId];

      // Aplicar filtros dinamicamente
      if (filters.search) {
        query += ' AND (nome LIKE ? OR email LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.situacao && filters.situacao !== 'todos') {
        query += ' AND situacao = ?';
        params.push(filters.situacao);
      }

      if (filters.letra && filters.letra !== 'todos') {
        query += ' AND UPPER(SUBSTRING(nome, 1, 1)) = ?';
        params.push(filters.letra.toUpperCase());
      }

      query += ' ORDER BY nome';

      const [contacts] = await pool.execute(query, params);
      return contacts;
    } catch (error) {
      throw new Error(`Erro ao buscar contatos com filtros: ${error.message}`);
    }
  }

  // Excluir todos os contatos de um usuário
  static async deleteAllByUserId(userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM contatos WHERE usuario_id = ?',
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Erro ao excluir contatos do usuário: ${error.message}`);
    }
  }
}

module.exports = Contact;