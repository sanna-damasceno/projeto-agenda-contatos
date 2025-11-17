import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; // ← IMPORTAR O CONTEXTO

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // ← PEGA A FUNÇÃO REGISTER DO CONTEXTO
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

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

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // 🔐 CHAMADA REAL PARA O BACKEND
      const result = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      if (result.success) {
        // Redirecionar para dashboard automaticamente
        navigate('/dashboard');
      } else {
        setError(result.error || 'Erro ao criar conta');
      }
    } catch (error) {
      setError('Erro de conexão com o servidor');
      console.error('Erro no cadastro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="background-section">
        <div className="welcome-text-cadastro">BEM-VINDO!</div>
        <img 
          className="background-image" 
          src="/images/imagem_login.png" 
          alt="Background" 
        />
      </div>

      <div className="form-section">
        <div className="form-card">
          <div className="form-title">CADASTRO</div>
          <div className="form-subtitle">Organize seus contatos</div>

          {/* 🔴 MENSAGEM DE ERRO */}
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <div className="input-container">
                <i className="fas fa-user input-icon"></i>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

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
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-container">
                <i className="fas fa-phone input-icon"></i>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Digite seu telefone"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

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
                  required
                  disabled={loading}
                  minLength="6"
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-container">
                <i className="fas fa-lock input-icon"></i>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Digite sua senha novamente"
                  className="form-input"
                  required
                  disabled={loading}
                  minLength="6"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              <i className="fas fa-user-plus"></i>
              {loading ? 'CADASTRANDO...' : 'CADASTRAR'}
            </button>

            <div className="register-link">
              <Link to="/login">
                <i className="fas fa-arrow-left"></i>
                VOLTAR PARA LOGIN
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;