// frontend/services/errorHandler.js
export class ErrorHandler {
  static handle(error, context = '') {
    console.error(`Erro em ${context}:`, error);

    let userMessage = 'Ocorreu um erro inesperado. Tente novamente.';
    let type = 'error';

    // Erros de rede
    if (!error.response) {
      userMessage = 'Erro de conexão. Verifique sua internet.';
      type = 'error';
    }
    // Erros HTTP
    else if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          userMessage = this.formatValidationErrors(error.response.data);
          type = 'warning';
          break;
        case 401:
          userMessage = 'Sessão expirada. Faça login novamente.';
          type = 'warning';
          // Opcional: logout automático
          setTimeout(() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }, 2000);
          break;
        case 403:
          userMessage = 'Você não tem permissão para esta ação.';
          type = 'error';
          break;
        case 404:
          userMessage = 'Recurso não encontrado.';
          type = 'warning';
          break;
        case 409:
          userMessage = error.response.data.message || 'Conflito de dados.';
          type = 'warning';
          break;
        case 422:
          userMessage = this.formatValidationErrors(error.response.data);
          type = 'warning';
          break;
        case 500:
          userMessage = 'Erro interno do servidor. Tente novamente.';
          type = 'error';
          break;
        default:
          userMessage = error.response.data?.message || `Erro ${status}`;
      }
    }
    // Erros de timeout
    else if (error.code === 'ECONNABORTED') {
      userMessage = 'Tempo de conexão esgotado. Tente novamente.';
      type = 'warning';
    }

    // Mostrar notificação
    if (window.showToast) {
      window.showToast(userMessage, type);
    } else {
      alert(userMessage); // Fallback
    }

    return { userMessage, type, originalError: error };
  }

  static formatValidationErrors(errorData) {
    if (errorData.details && Array.isArray(errorData.details)) {
      return errorData.details.map(detail => 
        `${detail.field}: ${detail.message}`
      ).join(', ');
    }
    return errorData.message || 'Dados inválidos. Verifique os campos.';
  }
}