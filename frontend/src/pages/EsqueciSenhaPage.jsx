import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api'; 
import { FaEnvelope, FaPaperPlane, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import "../App.css";

const EsqueciSenhaPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Por favor, digite seu e-mail');
      setLoading(false);
      return;
    }

    try {
      // CHAMADA PARA O BACKEND
      const result = await authService.forgotPassword({ email });
      
      setSuccess(result.message || 'Instruções de recuperação enviadas para seu e-mail!');
      
      // Redirecionar após sucesso
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setError(error.message || 'Erro ao solicitar recuperação de senha');
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
          <div className="auth-welcome-text">RECUPERAR SENHA</div>
          <img 
            className="auth-image" 
            src="/images/imagem_login.png" 
            alt="Background" 
          />
        </div>

        {/* Form Section */}
        <div className="auth-form-section">
          <div className="auth-form-card">
            <div className="auth-form-title">RECUPERAÇÃO DE SENHA</div>
            <div className="auth-form-subtitle">
              As instruções para recuperação de senha serão enviadas para o e-mail inserido
            </div>

            {/* MENSAGEM DE ERRO */}
            {error && (
              <div className="error-message">
                <FaExclamationCircle className="message-icon" />
                {error}
              </div>
            )}

            {/* MENSAGEM DE SUCESSO */}
            {success && (
              <div className="success-message">
                <FaCheckCircle className="message-icon" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Campo Email */}
              <div className="auth-input-group">
                <div className="auth-input-container">
                  <FaEnvelope className="auth-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail cadastrado"
                    className="auth-form-input"
                    required
                    disabled={loading || success}
                  />
                </div>
              </div>

              {/* Botão Enviar */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading || success}
              >
                <FaPaperPlane className="btn-icon" />
                {loading ? 'ENVIANDO...' : success ? 'ENVIADO!' : 'ENVIAR INSTRUÇÕES'}
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

export default EsqueciSenhaPage;