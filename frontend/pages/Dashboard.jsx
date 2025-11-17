import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { contactService } from '../services/api';
import '../App.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ← PEGA USUÁRIO E LOGOUT DO CONTEXTO
  
  // Estado para os contatos (AGORA DO BACKEND)
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
    logout(); // ← USA A FUNÇÃO DO CONTEXTO
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
        
        // Adicionar o novo contato à lista
        setContatos([...contatos, result.contact]);
        setMostrarModal(false);
        
        // Recarregar a lista para garantir sincronização
        loadContacts();
        
        alert('Contato adicionado com sucesso!');
      } catch (error) {
        alert('Erro ao adicionar contato: ' + error.message);
      }
    } else {
      alert('Preencha pelo menos nome e e-mail!');
    }
  }

  // Função para remover contato 
  const removerContato = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este contato?')) {
      try {
        await contactService.deleteContact(id);
        setContatos(contatos.filter(contato => contato.id !== id));
        alert('Contato removido com sucesso!');
      } catch (error) {
        alert('Erro ao remover contato: ' + error.message);
      }
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
  // REMOVA a verificação do telefone, mantenha apenas nome e email obrigatórios
  if (editarContato.nome && editarContato.email) {
    try {
      await contactService.updateContact(editarContato.id, {
        name: editarContato.nome,
        email: editarContato.email,
        phone: editarContato.telefone || '', // Permite string vazia
        notes: editarContato.observacoes || '',
        status: 'Não Registrado'
      });

      setMostrarModalEdicao(false);
      setEditarContato(null);
      loadContacts();
      alert('Contato atualizado com sucesso!');
      
    } catch (error) {
      alert('Erro ao atualizar contato: ' + error.message);
    }
  } else {
    alert('Preencha pelo menos nome e e-mail!'); // Mantém apenas nome e email como obrigatórios
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
    <>

      {/* Botão do Perfil */}
      <div className="perfil-btn" onClick={() => navigate('/perfil')}>
        👤 Meu Perfil
      </div>

      {/* Botão de Logout com nome do usuário */}
      <div className="logout-btn" onClick={handleLogout}>
        Sair ({user?.name})
      </div>
      
      {/* Botão de Logout com nome do usuário */}
      <div className="logout-btn" onClick={handleLogout}>
        Sair ({user?.name})
      </div>

      {/* MENSAGEM DE ERRO */}
      {error && (
        <div className="error-message-dashboard">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <div className="dashboard-container">
        {/* Background */}
        <div className="dashboard-background" />
        
        {/* Tabela de contatos */}
        <div className="tabela-contatos" />
        
        {/* Linhas da tabela */}
        <div className="linha-tabela linha-1" />
        <div className="linha-tabela linha-2" />
        <div className="linha-tabela linha-3" />
        
        {/* Cabeçalhos da tabela */}
        <div className="cabecalho acoes">Ações</div>
        <div className="cabecalho situacao">Situação</div>
        <div className="cabecalho observacoes">Observações</div>
        <div className="cabecalho telefone">Telefone</div>
        <div className="cabecalho email">E-mail</div>
        <div className="cabecalho nome">Nome</div>

        {/* Lista de contatos dinâmica */}
        {contatosPaginados.map((contato, index) => {
          const topPosition = 269 + (index * 47);
          const nome = contato.name || contato.nome;
          const email = contato.email;
          const telefone = contato.phone || contato.telefone;          
          const observacoes = contato.notes || contato.observacoes;
          const situacao = contato.status || contato.situacao;
          
          return (
            <div key={contato.id}>
              {/* Indicador de situação */}
              <div 
                className={`indicador-situacao ${situacao === 'Registrado' ? 'registrado' : 'nao-registrado'}`}
                style={{ top: `${topPosition + 8}px` }}
                title="Status automático"
              />
              
              {/* Situação */}
              <div 
                className="texto-situacao"
                style={{ top: `${topPosition + 8}px` }}
              >
                {situacao === 'Registrado' ? 'Registrado' : 'Não Registrado'}
              </div>

              {/* Nome */}
              <div className="contato-nome" style={{ top: `${topPosition + 8}px` }}>
                {nome}
              </div>

              {/* Telefone */}
              <div className="contato-telefone" style={{ top: `${topPosition + 8}px` }}>
                {telefone}
              </div>

              {/* Email */}
              <div className="contato-email" style={{ top: `${topPosition + 8}px` }}>
                {email}
              </div>

              {/* Observações */}
              <div className="contato-observacoes" style={{ top: `${topPosition + 8}px` }}>
                {observacoes}
              </div>

              {/* Botões de ação - Editar */}
              <div 
                className="btn-acao btn-editar"
                style={{ top: `${topPosition + 8}px` }}
                onClick={() => abrirModalEdicao(contato)}
                title="Editar contato"
              >
                ✏️
              </div>

              {/* Botões de ação - Excluir */}
              <div 
                className="btn-acao btn-excluir"
                style={{ top: `${topPosition + 8}px` }}
                onClick={() => removerContato(contato.id)}
                title="Excluir contato"
              >
                🗑️
              </div>
            </div>
          );
        })}

        {/* Mensagem quando não há contatos */}
        {contatosPaginados.length === 0 && !loading && (
          <div className="no-contacts-container">
            <div className="no-contacts-message">
              <h3>Nenhum contato encontrado</h3>
              <p>
                {contatos.length === 0 
                  ? 'Adicione seu primeiro contato clicando no botão acima!' 
                  : 'Tente ajustar os filtros ou termos de busca.'}
              </p>
              {contatos.length === 0 && (
                <button 
                  className="btn-adicionar-first"
                  onClick={abrirModalAdicionar}
                >+ Adicionar Primeiro Contato
                </button>
              )}
            </div>
          </div>
        )}

        {/* ... (resto do código permanece igual - busca, filtros, paginação, modal) */}
        {/* Campo de busca */}
        <div className="campo-busca">
          <div className="busca-icon">🔍</div>
          <input
            type="text"
            placeholder="Busque por nome ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="busca-input"
            maxLength={50}
          />
        </div>

        {/* Filtro por Situação com Dropdown */}
        <div className="filtro-container">
          <div 
            className="filtro-situacao"
            onClick={() => setMostrarDropdownSituacao(!mostrarDropdownSituacao)}
          >
            <div className="filtro-texto">
              {filtroSituacao === 'todos' ? 'Situação' : 
               filtroSituacao === 'registrados' ? 'Registrados' : 'Não Reg.'}
            </div>
            <div className="filtro-seta">▼</div>
          </div>

          {/* Dropdown Situação */}
          {mostrarDropdownSituacao && (
            <div className="dropdown-situacao">
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

        {/* Filtro por Alfabeto com Dropdown */}
        <div className="filtro-container">
          <div 
            className="filtro-alfabeto"
            onClick={() => setMostrarDropdownAlfabeto(!mostrarDropdownAlfabeto)}
          >
            <div className="filtro-texto">
              {filtroAlfabeto === 'todos' ? 'A-Z' : filtroAlfabeto}
            </div>
            <div className="filtro-seta">▼</div>
          </div>

          {/* Dropdown Alfabeto */}
          {mostrarDropdownAlfabeto && (
            <div className="dropdown-alfabeto">
              {opcoesAlfabeto.map((letra) => (
                <div 
                  key={letra}
                  className={`letra-item ${filtroAlfabeto === letra ? 'active' : ''}`}
                  onClick={() => selecionarFiltroAlfabeto(letra)}
                >
                  {letra === 'todos' ? 'Todos' : letra}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {/* Botão Anterior */}
        <div 
          className={`btn-paginacao anterior ${paginaAtual > 1 ? 'active' : 'disabled'}`}
          onClick={paginaAnterior}
        />
        <div className={`texto-paginacao anterior ${paginaAtual > 1 ? 'active' : 'disabled'}`}>
          Anterior
        </div>

        {/* Botão Próximo */}
        <div 
          className={`btn-paginacao proximo ${paginaAtual < totalPaginas ? 'active' : 'disabled'}`}
          onClick={proximaPagina}
        />
        <div className={`texto-paginacao proximo ${paginaAtual < totalPaginas ? 'active' : 'disabled'}`}>
          Próximo
        </div>

        {/* Números da paginação */}
        {Array.from({ length: totalPaginas }, (_, index) => {
          const numero = index + 1;
          const leftPosition = 300 + (index * 32); // Posição dinâmica
          
          // Mostrar apenas algumas páginas ao redor da atual
          if (
            numero === 1 || 
            numero === totalPaginas || 
            (numero >= paginaAtual - 1 && numero <= paginaAtual + 1)
          ) {
            return (
              <div key={numero}>
                <div 
                  className={`numero-pagina ${paginaAtual === numero ? 'active' : ''}`}
                  style={{ left: `${leftPosition}px` }}
                  onClick={() => irParaPagina(numero)}
                />
                <div 
                  className={`texto-numero-pagina ${paginaAtual === numero ? 'active' : ''}`}
                  style={{ left: `${leftPosition + 8}px` }}
                >
                  {numero}
                </div>
              </div>
            );
          }
  
          // Mostrar "..." para páginas não visíveis
          if (numero === paginaAtual - 2 || numero === paginaAtual + 2) {
            return (
              <div key={numero}>
                <div 
                  className="texto-numero-pagina"
                  style={{ left: `${leftPosition + 8}px` }}
                >
                  ...
                </div>
              </div>
            );
          }
          
          return null;
        })}

        {/* Título com contador */}
        <div className="titulo-dashboard">
          Contatos ({contatosFiltrados.length})
        </div>

         {/*BOTÃO ABRIR MODAL*/}
        <div className="btn-adicionar" onClick={abrirModalAdicionar}>
          <div className="btn-adicionar-icon">+</div>
          <div className="btn-adicionar-texto">Adicionar Contato</div>
        </div>

      </div>

      {/* Modal para adicionar contato */}
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
              placeholder="Email*"
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
              <button 
                onClick={salvarContato}
                className="btn-modal btn-salvar"
              >
                Salvar Contato
              </button>
              
              <button 
                onClick={() => setMostrarModal(false)}
                className="btn-modal btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para fechar dropdowns ao clicar fora */}
      {(mostrarDropdownSituacao || mostrarDropdownAlfabeto) && (
        <div 
          className="dropdown-overlay"
          onClick={() => {
            setMostrarDropdownSituacao(false)
            setMostrarDropdownAlfabeto(false)
          }}
        />
      )}
      {/* Modal para EDITAR contato */}
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
              <button 
                onClick={salvarEdicao}
                className="btn-modal btn-salvar"
              >Salvar Alterações
              </button>
              <button 
                onClick={() => {
                  setMostrarModalEdicao(false);
                  setEditarContato(null);
                }}
                className="btn-modal btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
      
  );
}

export default Dashboard;