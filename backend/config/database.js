/**
 * CONFIGURAÇÃO DO BANCO DE DADOS MYSQL
 * 
 * Este arquivo cria e gerencia o pool de conexões com o MySQL.
 * 
 * O QUE FAZ:
 * - Cria um pool de conexões reutilizáveis para melhor performance
 * - Configura as credenciais do banco via variáveis de ambiente
 * - Testa a conexão quando o servidor inicia
 * - Gerencia múltiplas conexões simultâneas de forma eficiente
 * 
 * POR QUE É IMPORTANTE:
 * - Evita sobrecarregar o banco com muitas conexões
 * - Melhora a performance da aplicação
 * - Permite que múltiplos usuários acessem simultaneamente
 * - Fornece feedback imediato se houver problema de conexão
 * */


const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agenda_contatos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão ao iniciar
pool.getConnection()
  .then(connection => {
    console.log('✅ Conectado ao MySQL com sucesso!');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Erro ao conectar no MySQL:', error.message);
  });

module.exports = pool;