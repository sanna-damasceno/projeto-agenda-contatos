import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { contactService } from '../services/api';
import { FaSignOutAlt, FaSearch, FaFilter, FaSortAlphaDown, FaPlus, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  
  // Estado para os contatos 
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editarContato, setEditarContato] = useState(null);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  
  // Estado para novo contato
  const [novoContato, setNovoContato] = useState({
    nome: '',
    email: '',
    telefone: '',
    observacoes: ''
  })

  // Estado para busca
  const [busca, setBusca] = useState('')
  const [filtroSituacao, setFiltroSituacao] = useState('todos')
  const [filtroAlfabeto, setFiltroAlfabeto] = useState('todos')
  
  // Estados para dropdowns
  const [mostrarDropdownSituacao, setMostrarDropdownSituacao] = useState(false)
  const [mostrarDropdownAlfabeto, setMostrarDropdownAlfabeto] = useState(false)

  // Estado para modal e paginação
  const [mostrarModal, setMostrarModal] = useState(false)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 5

  // CARREGAR CONTATOS DO BACKEND
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await contactService.getContacts();
      setContatos(data);
    } catch (error) {
      setError('Erro ao carregar contatos');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  // Função para adicionar contato 
  const abrirModalAdicionar = () => {
    setNovoContato({ nome: '', email: '', telefone: '', observacoes: '' })
    setMostrarModal(true)
  }

  // Função para salvar contato do modal
  const salvarContato = async () => {
    if (novoContato.nome && novoContato.email) {
      try {
        const result = await contactService.createContact({
          name: novoContato.nome,
          email: novoContato.email,
          phone: novoContato.telefone || '',
          notes: novoContato.observacoes || ''
        });
        
        setMostrarModal(false);
        loadContacts();
        window.showSuccess('Contato adicionado com sucesso!');
      } catch (error) {
        window.showError('Erro ao adicionar contato: ' + error.message);
      }
    } else {
      window.showWarning('Preencha pelo menos nome e e-mail!');
    }
  }

  // Função para remover contato 
  const removerContato = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este contato?')) {
      try {
        await contactService.deleteContact(id);
        setContatos(contatos.filter(contato => contato.id !== id));
        window.showSuccess('Contato removido com sucesso!');
      } catch (error) {
        window.showError('Erro ao remover contato: ' + error.message);
      }
    } else {
      window.showInfo('Remoção cancelada');
    }
  }

  // Função para abrir modal de edição
  const abrirModalEdicao = (contato) => {
    setEditarContato({
      id: contato.id,
      nome: contato.name || contato.nome,
      email: contato.email || '',
      telefone: contato.phone || contato.telefone,
      observacoes: contato.notes || contato.observacoes || ''
    });
    setMostrarModalEdicao(true);
  };

  // Função para salvar edição
  const salvarEdicao = async () => {
    if (editarContato.nome && editarContato.email) {
      try {
        await contactService.updateContact(editarContato.id, {
          name: editarContato.nome,
          email: editarContato.email,
          phone: editarContato.telefone || '',
          notes: editarContato.observacoes || '',
          status: 'Não Registrado'
        });

        setMostrarModalEdicao(false);
        setEditarContato(null);
        loadContacts();
        window.showSuccess('Contato atualizado com sucesso!');

      } catch (error) {
        window.showError('Erro ao atualizar contato: ' + error.message);
      }
    } else {
      window.showWarning('Preencha pelo menos nome e e-mail!'); 
    }
  };

  // Filtrar contatos 
  const contatosFiltrados = contatos.filter(contato => {
    const nome = contato.name || contato.nome;
    const email = contato.email;
    const situacao = contato.status || contato.situacao;
    
    const buscaMatch = nome.toLowerCase().includes(busca.toLowerCase()) || 
                      email.toLowerCase().includes(busca.toLowerCase());
    
    // Filtro por situação
    let situacaoMatch = true;
    if (filtroSituacao === 'registrados') situacaoMatch = situacao === 'Registrado';
    if (filtroSituacao === 'nao-registrados') situacaoMatch = situacao === 'Não Registrado';
    
    // Filtro por alfabeto
    let alfabetoMatch = true;
    if (filtroAlfabeto !== 'todos') {
      const primeiraLetra = nome.charAt(0).toUpperCase();
      alfabetoMatch = primeiraLetra === filtroAlfabeto;
    }
    
    return buscaMatch && situacaoMatch && alfabetoMatch;
  });

  // Ordenar contatos por nome (A-Z)
  const contatosOrdenados = [...contatosFiltrados].sort((a, b) => 
    (a.name || a.nome).localeCompare(b.name || b.nome)
  );

  // Lógica de paginação
  const totalPaginas = Math.ceil(contatosOrdenados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const contatosPaginados = contatosOrdenados.slice(inicio, fim);

  // Funções de paginação
  const irParaPagina = (pagina) => {
    setPaginaAtual(pagina);
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  // Funções para selecionar filtros
  const selecionarFiltroSituacao = (filtro) => {
    setFiltroSituacao(filtro);
    setMostrarDropdownSituacao(false);
    setPaginaAtual(1);
  };

  const selecionarFiltroAlfabeto = (filtro) => {
    setFiltroAlfabeto(filtro);
    setMostrarDropdownAlfabeto(false);
    setPaginaAtual(1);
  };

  // Gerar opções de alfabeto (A-Z)
  const opcoesAlfabeto = ['todos', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  // MENSAGEM DE CARREGAMENTO/ERRO
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando contatos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-responsive">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-main">
          <h1 className="dashboard-title">Contate-se</h1>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/perfil')}>
              <FaUser className="btn-icon" />
              <span className="btn-text">Meu Perfil</span>
            </button>
            <button className="btn btn-danger" onClick={handleLogout}>
              <FaSignOutAlt className="btn-icon" />
              <span className="btn-text">Sair</span>
            </button>
          </div>
        </div>

        {/* BARRA DE AÇÕES */}
        <div className="actions-bar">
          <button className="btn-add" onClick={abrirModalAdicionar}>
            <FaPlus className="btn-icon" />
            <span>Adicionar Contato</span>
          </button>
          
          <div className="search-filters">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Busque por nome ou e-mail"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="search-input"
                maxLength={50}
              />
            </div>

            {/* FILTRO SITUAÇÃO */}
            <div className="filter-container">
              <button 
                className="filter-btn"
                onClick={() => setMostrarDropdownSituacao(!mostrarDropdownSituacao)}
              >
                <FaFilter className="btn-icon" />
                <span>
                  {filtroSituacao === 'todos' ? 'Situação' : 
                   filtroSituacao === 'registrados' ? 'Registrados' : 'Não Reg.'}
                </span>
              </button>

              {mostrarDropdownSituacao && (
                <div className="dropdown-menu">
                  <div 
                    className={`dropdown-item ${filtroSituacao === 'todos' ? 'active' : ''}`}
                    onClick={() => selecionarFiltroSituacao('todos')}
                  >
                    Todos
                  </div>
                  <div 
                    className={`dropdown-item ${filtroSituacao === 'registrados' ? 'active' : ''}`}
                    onClick={() => selecionarFiltroSituacao('registrados')}
                  >
                    Registrados
                  </div>
                  <div 
                    className={`dropdown-item ${filtroSituacao === 'nao-registrados' ? 'active' : ''}`}
                    onClick={() => selecionarFiltroSituacao('nao-registrados')}
                  >
                    Não Registrados
                  </div>
                </div>
              )}
            </div>

            {/* FILTRO ALFABETO */}
            <div className="filter-container">
              <button 
                className="filter-btn"
                onClick={() => setMostrarDropdownAlfabeto(!mostrarDropdownAlfabeto)}
              >
                <FaSortAlphaDown className="btn-icon" />
                <span>{filtroAlfabeto === 'todos' ? 'A-Z' : filtroAlfabeto}</span>
              </button>

              {mostrarDropdownAlfabeto && (
                <div className="dropdown-menu alphabet-grid">
                  {opcoesAlfabeto.map((letra) => (
                    <div 
                      key={letra}
                      className={`dropdown-item ${filtroAlfabeto === letra ? 'active' : ''}`}
                      onClick={() => selecionarFiltroAlfabeto(letra)}
                    >
                      {letra === 'todos' ? 'Todos' : letra}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MENSAGEM DE ERRO */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* CONTADOR */}
      <div className="contacts-counter">
        Contatos ({contatosFiltrados.length})
      </div>

      {/* TABELA DE CONTATOS */}
      <div className="table-container">
        {contatosPaginados.length > 0 ? (
          <>
            {/* TABELA PARA DESKTOP */}
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th className="hide-mobile">Telefone</th>
                  <th className="hide-mobile">Observações</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {contatosPaginados.map((contato) => {
                  const nome = contato.name || contato.nome;
                  const email = contato.email;
                  const telefone = contato.phone || contato.telefone;
                  const observacoes = contato.notes || contato.observacoes;
                  const situacao = contato.status || contato.situacao;
                  
                  return (
                    <tr key={contato.id}>
                      <td className="contact-name">{nome}</td>
                      <td className="contact-email">{email}</td>
                      <td className="contact-phone hide-mobile">{telefone}</td>
                      <td className="contact-notes hide-mobile">{observacoes}</td>
                      <td>
                        <div className="status-indicator">
                          <span 
                            className={`status-dot ${situacao === 'Registrado' ? 'active' : 'inactive'}`}
                            title={situacao}
                          ></span>
                          <span className="status-text">
                            {situacao === 'Registrado' ? 'Registrado' : 'Não Registrado'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-edit"
                            onClick={() => abrirModalEdicao(contato)}
                            title="Editar contato"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-action btn-delete"
                            onClick={() => removerContato(contato.id)}
                            title="Excluir contato"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* CARDS PARA MOBILE */}
            <div className="mobile-cards">
              {contatosPaginados.map((contato) => {
                const nome = contato.name || contato.nome;
                const email = contato.email;
                const telefone = contato.phone || contato.telefone;
                const observacoes = contato.notes || contato.observacoes;
                const situacao = contato.status || contato.situacao;
                
                return (
                  <div key={contato.id} className="contact-card">
                    <div className="card-header">
                      <h3 className="card-name">{nome}</h3>
                      <div className="card-status">
                        <span 
                          className={`status-dot ${situacao === 'Registrado' ? 'active' : 'inactive'}`}
                        ></span>
                        {situacao === 'Registrado' ? 'Registrado' : 'Não Registrado'}
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="card-field">
                        <strong>E-mail:</strong> {email}
                      </div>
                      <div className="card-field">
                        <strong>Telefone:</strong> {telefone || 'Não informado'}
                      </div>
                      {observacoes && (
                        <div className="card-field">
                          <strong>Observações:</strong> {observacoes}
                        </div>
                      )}
                    </div>
                    <div className="card-actions">
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => abrirModalEdicao(contato)}
                      >
                        <FaEdit /> Editar
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => removerContato(contato.id)}
                      >
                        <FaTrash /> Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* MENSAGEM SEM CONTATOS */
          <div className="no-contacts">
            <div className="no-contacts-content">
              <h3>Nenhum contato encontrado</h3>
              <p>
                {contatos.length === 0 
                  ? 'Adicione seu primeiro contato clicando no botão acima!' 
                  : 'Tente ajustar os filtros ou termos de busca.'}
              </p>
              {contatos.length === 0 && (
                <button 
                  className="btn-add-first"
                  onClick={abrirModalAdicionar}
                >
                  <FaPlus /> Adicionar Primeiro Contato
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PAGINAÇÃO */}
      {contatosPaginados.length > 0 && totalPaginas > 1 && (
        <div className="pagination">
          <button 
            className={`pagination-btn prev ${paginaAtual === 1 ? 'disabled' : ''}`}
            onClick={paginaAnterior}
            disabled={paginaAtual === 1}
          >
            Anterior
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPaginas }, (_, index) => {
              const pagina = index + 1;
              
              // Mostrar primeira, última e páginas próximas
              if (
                pagina === 1 || 
                pagina === totalPaginas || 
                (pagina >= paginaAtual - 1 && pagina <= paginaAtual + 1)
              ) {
                return (
                  <button
                    key={pagina}
                    className={`pagination-number ${pagina === paginaAtual ? 'active' : ''}`}
                    onClick={() => irParaPagina(pagina)}
                  >
                    {pagina}
                  </button>
                );
              }
              
              // Mostrar ellipsis
              if (pagina === paginaAtual - 2 || pagina === paginaAtual + 2) {
                return <span key={pagina} className="pagination-ellipsis">...</span>;
              }
              
              return null;
            })}
          </div>

          <button 
            className={`pagination-btn next ${paginaAtual === totalPaginas ? 'disabled' : ''}`}
            onClick={proximaPagina}
            disabled={paginaAtual === totalPaginas}
          >
            Próximo
          </button>
        </div>
      )}

      {/* MODAIS */}
      {/* Modal Adicionar Contato */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Adicionar Novo Contato</h3>
            <input
              type="text"
              placeholder="Nome *"
              value={novoContato.nome}
              onChange={(e) => setNovoContato({...novoContato, nome: e.target.value})}
              className="modal-input"
              maxLength={100}
            />
            <input
              type="email"
              placeholder="Email *"
              value={novoContato.email}
              onChange={(e) => setNovoContato({...novoContato, email: e.target.value})}
              className="modal-input"
              maxLength={100}
            />
            <input
              type="text"
              placeholder="Telefone"
              value={novoContato.telefone}
              onChange={(e) => setNovoContato({...novoContato, telefone: e.target.value})}
              className="modal-input"
              maxLength={20}
            />
            <input
              type="text"
              placeholder="Observações"
              value={novoContato.observacoes}
              onChange={(e) => setNovoContato({...novoContato, observacoes: e.target.value})}
              className="modal-input"
              maxLength={100}
            />
            <div className="modal-buttons">
              <button onClick={salvarContato} className="btn btn-primary">
                Salvar Contato
              </button>
              <button onClick={() => setMostrarModal(false)} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Contato */}
      {mostrarModalEdicao && editarContato && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Contato</h3>
            <input
              type="text"
              placeholder="Nome *"
              value={editarContato.nome}
              onChange={(e) => setEditarContato({...editarContato, nome: e.target.value})}
              className="modal-input"
              maxLength={100}
            />
            <input
              type="email"
              placeholder="Email *"
              value={editarContato.email}
              onChange={(e) => setEditarContato({...editarContato, email: e.target.value})}
              className="modal-input"
              maxLength={100}
            />
            <input
              type="text"
              placeholder="Telefone"
              value={editarContato.telefone}
              onChange={(e) => setEditarContato({...editarContato, telefone: e.target.value})}
              className="modal-input"
              maxLength={20}
            />
            <input
              type="text"
              placeholder="Observações"
              value={editarContato.observacoes}
              onChange={(e) => setEditarContato({...editarContato, observacoes: e.target.value})}
              className="modal-input"
              maxLength={100}
            />
            <div className="modal-buttons">
              <button onClick={salvarEdicao} className="btn btn-primary">
                Salvar Alterações
              </button>
              <button 
                onClick={() => {
                  setMostrarModalEdicao(false);
                  setEditarContato(null);
                }} 
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para dropdowns */}
      {(mostrarDropdownSituacao || mostrarDropdownAlfabeto) && (
        <div 
          className="dropdown-overlay"
          onClick={() => {
            setMostrarDropdownSituacao(false);
            setMostrarDropdownAlfabeto(false);
          }}
        />
      )}
    </div>
  );
}

export default Dashboard;