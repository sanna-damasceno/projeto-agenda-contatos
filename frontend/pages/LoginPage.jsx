import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaCheckSquare, FaSquare } from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [keepConnected, setKeepConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpar erro quando o usuário digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validação básica
    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    try {
      // CHAMADA PARA O BACKEND
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Salvar preferência "manter conectado"
        if (keepConnected) {
          localStorage.setItem('keepConnected', 'true');
        }
        
        // Redirecionar para dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckbox = () => {
    setKeepConnected(!keepConnected);
  };

  return (
    <div className="auth-container">
      {/* Logo */}
      <img 
        className="auth-logo" 
        src="/images/logo_contate_se.png" 
        alt="Contate-se Logo" 
      />

      <div className="auth-content">
        {/* Background Section - Visível apenas em desktop */}
        <div className="auth-background">
          <div className="auth-welcome-text">BEM-VINDO!</div>
          <img 
            className="auth-image" 
            src="/images/imagem_login.png" 
            alt="Background" 
          />
        </div>

        {/* Form Section */}
        <div className="auth-form-section">
          <div className="auth-form-card">
            <div className="auth-form-title">LOGIN</div>
            <div className="auth-form-subtitle">Organize seus contatos</div>

            {/* MENSAGEM DE ERRO */}
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Campo Email */}
              <div className="auth-input-group">
                <div className="auth-input-container">
                  <FaEnvelope className="auth-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Digite seu e-mail"
                    className="auth-form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="auth-input-group">
                <div className="auth-input-container">
                  <FaLock className="auth-input-icon" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    className="auth-form-input"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Opções do Formulário */}
              <div className="auth-form-options">
                <div 
                  className="auth-checkbox-option"
                  onClick={toggleCheckbox}
                >
                  {keepConnected ? (
                    <FaCheckSquare className="checkbox-icon" />
                  ) : (
                    <FaSquare className="checkbox-icon" />
                  )}
                  <span>Manter conectado</span>
                </div>
                <Link to="/esqueci-senha" className="auth-forgot-password">
                  Esqueci minha senha
                </Link>
              </div>

              {/* Botão Entrar */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                <FaSignInAlt className="btn-icon" />
                {loading ? 'ENTRANDO...' : 'ENTRAR'}
              </button>

              {/* Link Cadastre-se */}
              <div className="auth-link">
                <Link to="/cadastro">
                  <FaUserPlus className="btn-icon" />
                  CADASTRE-SE
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;