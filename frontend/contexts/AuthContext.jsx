// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const data = await authService.getProfile();
      setUser(data.user);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // === FUNÇÃO NOVA PARA ATUALIZAR USUÁRIO ===
  const updateUser = (updatedUserData) => {
    setUser(prevUser => {
      if (!prevUser) return updatedUserData;
      
      const updatedUser = {
        ...prevUser,
        ...updatedUserData
      };
      
      // Opcional: atualizar também no localStorage se você armazena user lá
      // Se você quiser persistir os dados atualizados
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({ ...userData, ...updatedUserData }));
        }
      } catch (error) {
        console.warn('Erro ao atualizar usuário no localStorage:', error);
      }
      
      return updatedUser;
    });
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser, // ← FUNÇÃO ADICIONADA
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};