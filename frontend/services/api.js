// frontend/services/api.js
import { ErrorHandler } from './errorHandler';

const API_BASE_URL = 'http://localhost:5000/api';

// Função para fazer requisições autenticadas
const authRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  };

  // Adicionar timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
  config.signal = controller.signal;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `Erro ${response.status}: ${response.statusText}` };
      }
      
      // Criar erro estruturado para o ErrorHandler
      const error = new Error(errorData.error || 'Erro na requisição');
      error.response = {
        status: response.status,
        data: errorData
      };
      throw error;
    }

    const data = await response.json();
    
    // Mostrar mensagem de sucesso para operações que não sejam GET
    if (options.method && options.method !== 'GET' && window.showToast) {
      const actionMessages = {
        'POST': 'criado',
        'PUT': 'atualizado', 
        'DELETE': 'excluído'
      };
      const message = `${getResourceName(endpoint)} ${actionMessages[options.method]} com sucesso!`;
      window.showToast(message, 'success');
    }
    
    return data;

  } catch (error) {
    clearTimeout(timeoutId);
    
    // Tratar diferentes tipos de erro
    if (error.name === 'AbortError') {
      error.response = { status: 408, data: { error: 'Timeout da requisição' } };
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      error.response = { status: 0, data: { error: 'Erro de conexão com o servidor' } };
    }
    
    throw ErrorHandler.handle(error, `API: ${endpoint}`);
  }
};

// Helper para identificar o recurso nas mensagens de sucesso
function getResourceName(endpoint) {
  if (endpoint.includes('/contacts')) return 'Contato';
  if (endpoint.includes('/auth/register')) return 'Usuário';
  if (endpoint.includes('/auth/login')) return 'Login';
  if (endpoint.includes('/user/profile')) return 'Perfil';
  return 'Registro';
}

// Serviços de autenticação
export const authService = {
  register: async (userData) => {
    const result = await authRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Mensagem personalizada para registro
    if (window.showToast) {
      window.showToast('Cadastro realizado com sucesso!', 'success');
    }
    
    return result;
  },

  login: async (credentials) => {
    const result = await authRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    return result;
  },

  getProfile: () =>
    authRequest('/auth/profile'),

  forgotPassword: (emailData) =>
    authRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(emailData),
    }),

  resetPassword: (resetData) =>
    authRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData),
    }),
};

// Serviços de contatos
export const contactService = {
  getContacts: () =>
    authRequest('/contacts'),

  createContact: (contactData) =>
    authRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    }),

  updateContact: (id, contactData) =>
    authRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    }),

  deleteContact: async (id) => {
    const result = await authRequest(`/contacts/${id}`, {
      method: 'DELETE',
    });
    
    
    return result;
  },
};



// Serviços de usuário/perfil
export const userService = {
  // Buscar perfil do usuário
  getProfile: () =>
    authRequest('/user/profile'),

  // Atualizar perfil do usuário
  updateProfile: async (profileData) => {
    const result = await authRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    return result;
  },

  // Alterar senha (opcional - se quiser implementar depois)
  changePassword: async (passwordData) => {
    const result = await authRequest('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
    
    if (window.showToast) {
      window.showToast('Senha alterada com sucesso!', 'success');
    }
    
    return result;
  },

  // Upload de avatar (opcional - se quiser implementar depois)
  uploadAvatar: async (formData) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao fazer upload do avatar');
    }

    const result = await response.json();
    
    if (window.showToast) {
      window.showToast('Avatar atualizado com sucesso!', 'success');
    }
    
    return result;
  }
};