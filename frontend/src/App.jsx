
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import Dashboard from './pages/Dashboard';
import EsqueciSenhaPage from './pages/EsqueciSenhaPage';
import PerfilPage from './pages/PerfilPage'; 
import ToastNotification from './components/ToastNotification';
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ToastNotification />
          <Routes>
            {/* Rota raiz - redireciona para dashboard se logado, senão para login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Rotas públicas (acessíveis sem login) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
            <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
            
            {/* Rotas protegidas (requerem login) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Rota do perfil do usuário */}
            <Route path="/perfil" element={
              <ProtectedRoute>
                <PerfilPage />
              </ProtectedRoute>
            } />
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;