import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api'; 
import '../App.css';

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
      
      setSuccess(result.message);
      
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setError(error.message || 'Erro ao solicitar recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="esqueci-senha-container">
      {/* Lado Direito - Formulário */}
      <div className="esqueci-senha-form-section">
        <div className="esqueci-senha-form-card">
          <div className="esqueci-senha-form-title">RECUPERAÇÃO DE SENHA</div>
          <div className="esqueci-senha-form-subtitle">
            As instruções para recuperação de senha<br/>
            serão enviadas para o e-mail inserido
          </div>

          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* MENSAGEM DE SUCESSO */}
          {success && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Campo Email */}
            <div className="esqueci-senha-input-group">
              <div className="esqueci-senha-input-container">
                <i className="fas fa-envelope esqueci-senha-input-icon"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="esqueci-senha-form-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Botão Enviar */}
            <button 
              type="submit" 
              className="esqueci-senha-submit-btn"
              disabled={loading}
            >
              <i className="fas fa-paper-plane"></i>
              {loading ? 'ENVIANDO...' : 'ENVIAR'}
            </button>

            {/* Link Voltar para Login */}
            <div className="esqueci-senha-login-link">
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

export default EsqueciSenhaPage;