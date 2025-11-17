import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ← PEGA A FUNÇÃO LOGIN DO CONTEXTO
  
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
      // 🔐 CHAMADA REAL PARA O BACKEND
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
    <div className="login-container">
      {/* Lado Esquerdo - Background */}
      <div className="background-section">
        <div className="welcome-text">BEM-VINDO!</div>
        <div className="placeholder-rectangle"></div>
        <img 
          className="background-image" 
          src="/images/imagem_login.png" 
          alt="Background" 
        />
      </div>

      {/* Lado Direito - Formulário */}
      <div className="form-section">
        <div className="form-card">
          <div className="form-title">LOGIN</div>
          <div className="form-subtitle">Organize seus contatos</div>

          {/* 🔴 MENSAGEM DE ERRO */}
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div className="input-group">
              <div className="input-container">
                <i className="fas fa-envelope input-icon"></i>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Digite seu e-mail"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="input-group">
              <div className="input-container">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Opções do Formulário */}
            <div className="form-options">
              <div 
                className="checkbox-option"
                onClick={toggleCheckbox}
              >
                <i className={`fas ${keepConnected ? 'fa-check-square' : 'fa-square'}`}></i>
                <span>Manter conectado</span>
              </div>
              <Link to="/esqueci-senha" className="forgot-password">
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão Entrar */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              <i className="fas fa-sign-in-alt"></i>
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>

            {/* Link Cadastre-se */}
            <div className="register-link">
              <Link to="/cadastro">
                <i className="fas fa-user-plus"></i>
                CADASTRE-SE
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;