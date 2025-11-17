import React, { useState, useEffect } from 'react';

const ContactForm = ({ contact, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    status: 'Registrado'
  });

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    }
  }, [contact]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('O nome é obrigatório');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content contact-modal">
        <div className="modal-header">
          <h2>{contact ? 'Editar Contato' : 'Novo Contato'}</h2>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Situação</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
            >
              <option value="Registrado">Registrado</option>
              <option value="Não Registrado">Não Registrado</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {contact ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;