import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Perfil } from '../types/api';
import { USUARIOS_MOCK } from './dados';
import { ativarMocks, entrarComoMock, previewAtivo, reiniciarDadosMock, sairDoPreview } from './servidor';
import './preview.css';

interface Tela {
  rotulo: string;
  rota: string;
  nova?: boolean; //Tela criada nesta entrega
}

const TELAS: { perfil: Perfil; titulo: string; telas: Tela[] }[] = [
  {
    perfil: 'ADMINISTRADOR',
    titulo: '👤 Administrador',
    telas: [
      { rotulo: 'Gerenciar Livros (wireframe 20)', rota: '/admin/livros', nova: true },
      { rotulo: 'Editar livro', rota: '/admin/livros/30/editar', nova: true },
      { rotulo: 'Cadastro de livro', rota: '/admin/livros/novo' },
      { rotulo: 'Gestores', rota: '/admin/gestores', nova: true },
      { rotulo: 'Novo gestor', rota: '/admin/gestores/novo', nova: true },
      { rotulo: 'Detalhes do material (com editar/excluir)', rota: '/acervo/30', nova: true },
      { rotulo: 'Dashboard', rota: '/admin' },
    ],
  },
  {
    perfil: 'GESTOR',
    titulo: '🗂️ Gestor',
    telas: [
      { rotulo: 'Painel do gestor', rota: '/gestor', nova: true },
      { rotulo: 'Gerenciar Livros', rota: '/gestor/livros', nova: true },
      { rotulo: 'Editar livro', rota: '/gestor/livros/31/editar', nova: true },
      { rotulo: 'Cadastro de livro', rota: '/gestor/livros/novo', nova: true },
      { rotulo: 'Acervo digital', rota: '/acervo' },
    ],
  },
  {
    perfil: 'PROFESSOR',
    titulo: '👨‍🏫 Professor',
    telas: [
      { rotulo: 'Detalhes do material (sem editar/excluir)', rota: '/acervo/30' },
      { rotulo: 'Painel do professor', rota: '/professor' },
    ],
  },
];

//Página de entrada do modo de visualização: escolhe o perfil fictício e a tela (só em desenvolvimento)
export function Preview() {
  const navigate = useNavigate();

  function abrir(perfil: Perfil, rota: string) {
    entrarComoMock(perfil);
    navigate(rota);
  }

  function sair() {
    sairDoPreview();
    navigate('/preview', { replace: true });
  }

  return (
    <div className="preview">
      <header className="preview__cabecalho">
        <h1>🧪 Modo de visualização</h1>
        <p>
          Abra as telas com dados fictícios, sem back-end e sem login. As alterações (cadastrar, editar, excluir) ficam salvas
          só nesta aba do navegador.
        </p>
        <div className="preview__acoes">
          <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => { reiniciarDadosMock(); window.location.reload(); }}>
            ↺ Restaurar dados fictícios
          </button>
          {previewAtivo() && (
            <button type="button" className="botao botao--secundario botao--pequeno" onClick={sair}>Sair do modo de visualização</button>
          )}
        </div>
      </header>

      <div className="preview__grade">
        {TELAS.map(({ perfil, titulo, telas }) => (
          <section key={perfil} className="cartao">
            <h2 className="cartao__titulo">{titulo}</h2>
            <small className="dica">Entra como {USUARIOS_MOCK[perfil].nome}</small>
            <ul className="preview__lista">
              {telas.map(({ rotulo, rota, nova }) => (
                <li key={rota}>
                  <button type="button" onClick={() => abrir(perfil, rota)}>
                    {rotulo}
                    {nova && <span className="etiqueta etiqueta--verde">nova</span>}
                  </button>
                  <code>{rota}</code>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="cartao">
          <h2 className="cartao__titulo">🔑 Login</h2>
          <small className="dica">No modo de visualização, qualquer senha entra.</small>
          <ul className="preview__lista">
            <li>
              <Link to="/login/gestor" onClick={ativarMocks}>Login do gestor <span className="etiqueta etiqueta--verde">nova</span></Link>
              <code>/login/gestor</code>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

//Selo fixo exibido em todas as telas enquanto o modo de visualização está ativo
export function SeloPreview() {
  const { pathname } = useLocation();
  if (!previewAtivo() || pathname === '/preview') return null;
  return (
    <Link to="/preview" className="preview__selo" title="Voltar para a lista de telas">
      🧪 Dados fictícios · trocar tela
    </Link>
  );
}
