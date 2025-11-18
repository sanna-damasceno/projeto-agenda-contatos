import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userService } from '../services/api';
import { FaArrowLeft, FaSignOutAlt, FaEdit, FaSave, FaTimes, FaTrash, FaExclamationTriangle, FaUser, FaEnvelope, FaPhone, FaCalendar } from 'react-icons/fa';
import "../App.css";
function PerfilPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  
  const [dadosPerfil, setDadosPerfil] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editando, setEditando] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setDadosPerfil({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosPerfil(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const salvarPerfil = async () => {
    if (!dadosPerfil.name.trim()) {
      setMessage({ type: 'error', text: 'Nome é obrigatório!' });
      return;
    }

    setLoading(true);
    try {
      const resultado = await userService.updateProfile({
        name: dadosPerfil.name,
        phone: dadosPerfil.phone,
        avatar_url: dadosPerfil.avatar_url
      });
      
      // Atualizar contexto de autenticação
      updateUser({
        ...user,
        name: dadosPerfil.name,
        phone: dadosPerfil.phone,
        avatar_url: dadosPerfil.avatar_url
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Perfil atualizado com sucesso!' 
      });
      setEditando(false);
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao atualizar perfil!' 
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelarEdicao = () => {
    setDadosPerfil({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar_url: user.avatar_url || ''
    });
    setEditando(false);
    setMessage({ type: '', text: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Função para excluir conta
  const excluirConta = async () => {
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus contatos serão perdidos!')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/user/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir conta');
      }

      // Fazer logout e limpar dados
      logout();
      
      setMessage({ 
        type: 'success', 
        text: 'Conta excluída com sucesso!' 
      });
      
      // Redirecionar para página inicial
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao excluir conta!' 
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="profile-header">
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/dashboard')}
        >
          <FaArrowLeft className="btn-icon" />
          <span className="btn-text">Voltar ao Dashboard</span>
        </button>
        
        <h1 className="profile-title">Meu Perfil</h1>
        
        <button 
          className="btn btn-danger"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="btn-icon" />
          <span className="btn-text">Sair</span>
        </button>
      </header>

      {/* Mensagens */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Conteúdo do Perfil */}
      <div className="profile-container">
        {/* Avatar */}
        <div className="profile-avatar">
          <div className="avatar">
            {dadosPerfil.avatar_url ? (
              <img src={dadosPerfil.avatar_url} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {dadosPerfil.name ? dadosPerfil.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          
          {editando && (
            <input
              type="text"
              name="avatar_url"
              placeholder="URL da imagem do perfil"
              value={dadosPerfil.avatar_url}
              onChange={handleInputChange}
              className="avatar-input"
            />
          )}
        </div>

        {/* Formulário de Dados */}
        <div className="profile-data">
          <div className="profile-field">
            <label className="profile-label">
              <FaUser className="field-icon" />
              Nome
            </label>
            {editando ? (
              <input
                type="text"
                name="name"
                value={dadosPerfil.name}
                onChange={handleInputChange}
                className="profile-input"
                maxLength={100}
                placeholder="Seu nome completo"
              />
            ) : (
              <div className="profile-value">{dadosPerfil.name}</div>
            )}
          </div>

          <div className="profile-field">
            <label className="profile-label">
              <FaEnvelope className="field-icon" />
              E-mail
            </label>
            <div className="profile-value email-disabled">{dadosPerfil.email}</div>
            <small className="email-note">E-mail não pode ser alterado</small>
          </div>

          <div className="profile-field">
            <label className="profile-label">
              <FaPhone className="field-icon" />
              Telefone
            </label>
            {editando ? (
              <input
                type="text"
                name="phone"
                value={dadosPerfil.phone}
                onChange={handleInputChange}
                className="profile-input"
                maxLength={20}
                placeholder="(00) 00000-0000"
              />
            ) : (
              <div className="profile-value">
                {dadosPerfil.phone || 'Não informado'}
              </div>
            )}
          </div>

          <div className="profile-field">
            <label className="profile-label">
              <FaCalendar className="field-icon" />
              Membro desde
            </label>
            <div className="profile-value">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="profile-actions">
          {!editando ? (
            <button
              className="btn btn-primary"
              onClick={() => setEditando(true)}
            >
              <FaEdit className="btn-icon" />
              Editar Perfil
            </button>
          ) : (
            <div className="edit-buttons">
              <button
                className="btn btn-success"
                onClick={salvarPerfil}
                disabled={loading}
              >
                <FaSave className="btn-icon" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={cancelarEdicao}
                disabled={loading}
              >
                <FaTimes className="btn-icon" />
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Seção de Exclusão de Conta */}
        <div className="account-section">
          <h3 className="account-title">
            <FaExclamationTriangle className="title-icon" />
            Gerenciar Conta
          </h3>
          
          <div className="account-warning">
            <p><strong>⚠️ ATENÇÃO: Ação Irreversível</strong></p>
            <ul className="warning-list">
              <li>
                <FaTimes className="warning-icon" />
                Esta ação <strong>NÃO PODE</strong> ser desfeita
              </li>
              <li>
                <FaTrash className="warning-icon" />
                Todos os seus contatos serão <strong>permanentemente excluídos</strong>
              </li>
              <li>
                <FaUser className="warning-icon" />
                Seus dados serão <strong>removidos completamente</strong> do sistema
              </li>
            </ul>
          </div>

          <button
            className="btn btn-danger delete-account-btn"
            onClick={excluirConta}
            disabled={deleting || editando}
          >
            <FaTrash className="btn-icon" />
            {deleting ? 'Excluindo Conta...' : 'Excluir Conta Permanentemente'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PerfilPage;