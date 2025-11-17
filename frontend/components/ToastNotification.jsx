// frontend/components/ToastNotification.jsx
import { useState, useEffect } from 'react';
import '../App.css';


const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Exportar a função para uso global
  useEffect(() => {
    window.showToast = addToast;
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          {...toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
};

const Toast = ({ message, type, duration, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default ToastNotification;