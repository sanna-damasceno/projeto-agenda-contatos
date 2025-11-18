import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; 
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus, FaArrowLeft } from 'react-icons/fa';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
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
      // CHAMADA REAL PARA O BACKEND
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
            <div className="auth-form-title">CADASTRO</div>
            <div className="auth-form-subtitle">Crie sua conta para organizar seus contatos</div>

            {/* MENSAGEM DE ERRO */}
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Campo Nome */}
              <div className="auth-input-group">
                <div className="auth-input-container">
                  <FaUser className="auth-input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Digite seu nome completo"
                    className="auth-form-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

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
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Campo Telefone (Opcional) */}
              <div className="auth-input-group">
                <div className="auth-input-container">
                  <FaPhone className="auth-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Digite seu telefone (opcional)"
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
                    placeholder="Digite sua senha (mín. 6 caracteres)"
                    className="auth-form-input"
                    required
                    disabled={loading}
                    minLength="6"
                  />
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div className="auth-input-group">
                <div className="auth-input-container">
                  <FaLock className="auth-input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirme sua senha"
                    className="auth-form-input"
                    required
                    disabled={loading}
                    minLength="6"
                  />
                </div>
              </div>

              {/* Botão Cadastrar */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                <FaUserPlus className="btn-icon" />
                {loading ? 'CADASTRANDO...' : 'CADASTRAR'}
              </button>

              {/* Link Voltar para Login */}
              <div className="auth-link">
                <Link to="/login">
                  <FaArrowLeft className="btn-icon" />
                  VOLTAR PARA LOGIN
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;