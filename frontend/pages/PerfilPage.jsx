import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userService } from '../services/api';
import '../App.css';

function PerfilPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [dadosPerfil, setDadosPerfil] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editando, setEditando] = useState(false);


  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  // No PerfilPage.jsx, atualize a função salvarPerfil:
    const salvarPerfil = async () => {
    if (!dadosPerfil.name.trim()) {
        setMessage({ type: 'error', text: 'Nome é obrigatório!' });
        return;
    }

    setLoading(true);
    try {
        // Use o userService em vez de criar uma função separada
        const resultado = await userService.updateProfile({
        name: dadosPerfil.name,
        phone: dadosPerfil.phone,
        avatar_url: dadosPerfil.avatar_url
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
    // Você já tem essa função no AuthContext
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="loading-container">
        <p>Carregando...</p>
      </div>
    );
  }

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

      // Limpar dados do usuário
      localStorage.removeItem('token');
      
      // Mostrar mensagem de sucesso
      if (window.showToast) {
        window.showToast('Conta excluída com sucesso!', 'success');
      }
      
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
      setShowDeleteConfirm(false);
    }
  };

  
  return (
    <div className="perfil-container">
      {/* Header */}
      <div className="perfil-header">
        <button 
          className="btn-dashboard"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        
        <h1>Meu Perfil</h1>
        
        <button 
          className="btn-logout"
          onClick={handleLogout}
        >
          Sair
        </button>
      </div>

      {/* Mensagens */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Conteúdo do Perfil */}
      <div className="perfil-content">
        {/* Avatar */}
        <div className="avatar-section">
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
        <div className="dados-section">
          <div className="campo-perfil">
            <label>Nome</label>
            {editando ? (
              <input
                type="text"
                name="name"
                value={dadosPerfil.name}
                onChange={handleInputChange}
                className="input-perfil"
                maxLength={100}
              />
            ) : (
              <div className="valor-perfil">{dadosPerfil.name}</div>
            )}
          </div>

          <div className="campo-perfil">
            <label>E-mail</label>
            <div className="valor-perfil email-disabled">{dadosPerfil.email}</div>
            <small className="email-note">E-mail não pode ser alterado</small>
          </div>

          <div className="campo-perfil">
            <label>Telefone</label>
            {editando ? (
              <input
                type="text"
                name="phone"
                value={dadosPerfil.phone}
                onChange={handleInputChange}
                className="input-perfil"
                maxLength={20}
                placeholder="(00) 00000-0000"
              />
            ) : (
              <div className="valor-perfil">
                {dadosPerfil.phone || 'Não informado'}
              </div>
            )}
          </div>

          <div className="campo-perfil">
            <label>Membro desde</label>
            <div className="valor-perfil">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
            </div>
          </div>
        </div>

        {/* Botões de Ação */}


        <div className="acoes-section">
          {!editando ? (
            <button
              className="btn-editar-perfil"
              onClick={() => setEditando(true)}
            >
              ✏️ Editar Perfil
            </button>
          ) : (
            <div className="botoes-edicao">
              <button
                className="btn-salvar-perfil"
                onClick={salvarPerfil}
                disabled={loading}
              >
                {loading ? 'Salvando...' : '💾 Salvar Alterações'}
              </button>
              
              <button
                className="btn-cancelar-perfil"
                onClick={cancelarEdicao}
                disabled={loading}
              >
                ❌ Cancelar
              </button>
            </div>
            )}

            {/* Seção de Exclusão de Conta */}
          <div className="conta-section">
            <h3>Gerenciar Conta</h3>
            
            <div className="botoes-conta">
              <button
                className="btn-excluir-conta"
                onClick={excluirConta}
                disabled={deleting}
              >
                {deleting ? '⏳ Excluindo...' : '🗑️ Excluir Conta Permanentemente'}
              </button>
              </div>
              <div className="avisos-conta">
              <p><strong>⚠️ ATENÇÃO:</strong></p>
              <ul>
                <li>❌ Esta ação <strong>NÃO PODE</strong> ser desfeita</li>
                <li>📞 Todos os seus contatos serão <strong>permanentemente excluídos</strong></li>
                <li>🔒 Seus dados serão <strong>removidos completamente</strong> do sistema</li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default PerfilPage;