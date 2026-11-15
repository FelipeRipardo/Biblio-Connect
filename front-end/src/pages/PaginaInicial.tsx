import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarAlunos } from '../api/alunos';
import { listarMateriais } from '../api/materiais';
import { listarProfessores } from '../api/professores';
import { encerrarSessao, obterSessao } from '../api/sessao';
import { destinoDoPerfil } from '../components/LoginForm';

const RECURSOS = [
  { icone: '📚', cor: '#e8f4f8', titulo: 'Acervo Digital', texto: 'Livros e materiais educacionais online' },
  { icone: '🔍', cor: '#e8f5e9', titulo: 'Consulta Fácil', texto: 'Busque por título, autor ou disciplina' },
  { icone: '👨‍🎓', cor: '#fff3cd', titulo: 'Para Estudantes', texto: 'Acesso gratuito a todo o conteúdo' },
  { icone: '👨‍🏫', cor: '#f3e5f5', titulo: 'Para Professores', texto: 'Acompanhe as leituras dos seus alunos' },
];

const AVISO_ACERVO = 'Entre com a sua conta para acessar o acervo.';

interface Numeros {
  livros: number | null;
  materiais: number | null;
  alunos: number | null;
  professores: number | null;
}

const formatar = (valor: number | null) => (valor === null ? '—' : valor.toLocaleString('pt-BR'));

//Página inicial pública (wireframe 01)
export function PaginaInicial() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(obterSessao);
  const [numeros, setNumeros] = useState<Numeros | null>(null);

  //As rotas de consulta exigem JWT, então os números só são buscados com alguém logado
  useEffect(() => {
    if (!usuario) return;
    let ativo = true;
    Promise.allSettled([listarMateriais(), listarAlunos(), listarProfessores()]).then(([materiais, alunos, professores]) => {
      if (!ativo) return;
      const lista = materiais.status === 'fulfilled' ? materiais.value : null;
      setNumeros({
        livros: lista ? lista.filter((m) => m.tipoMaterial === 'LIVRO').length : null,
        materiais: lista ? lista.length : null,
        alunos: alunos.status === 'fulfilled' ? alunos.value.length : null,
        professores: professores.status === 'fulfilled' ? professores.value.length : null,
      });
    });
    return () => {
      ativo = false;
    };
  }, [usuario]);

  function acessarAcervo() {
    if (usuario) navigate('/acervo');
    else navigate('/login', { state: { mensagem: AVISO_ACERVO } });
  }

  function sair() {
    encerrarSessao();
    setUsuario(null);
    setNumeros(null);
  }

  return (
    <div className="inicio">
      <header className="inicio__topo">
        <Link to="/" className="inicio__marca">📚 BiblioConnect</Link>

        <nav className="inicio__nav" aria-label="Navegação principal">
          <a href="#inicio" className="inicio__nav-ativo">Início</a>
          <button type="button" onClick={acessarAcervo}>Acervo</button>
          <a href="#como-funciona">Como Funciona</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>

        <div className="inicio__conta">
          {usuario ? (
            <>
              <span className="inicio__ola">Olá, {usuario.nome.split(' ')[0]}</span>
              <Link to={destinoDoPerfil(usuario.perfil)} className="inicio__botao inicio__botao--verde">Meu painel</Link>
              <button type="button" className="inicio__botao inicio__botao--contorno" onClick={sair}>Sair</button>
            </>
          ) : (
            <Link to="/login" className="inicio__botao inicio__botao--contorno">Entrar</Link>
          )}
        </div>
      </header>

      <main>
        <section id="inicio" className="inicio__hero">
          <div className="inicio__hero-texto">
            <h1>BiblioConnect</h1>
            <p className="inicio__slogan">Sistema de Biblioteca Virtual para Escolas Públicas</p>
            <p>
              Organização, disponibilização e consulta de livros e materiais educacionais digitais. Facilitando o acesso
              dos estudantes e o gerenciamento do acervo pela comunidade escolar.
            </p>
            <div className="inicio__cta">
              <button type="button" className="inicio__botao inicio__botao--verde inicio__botao--grande" onClick={acessarAcervo}>
                📖 Acessar Acervo
              </button>
              <a href="#como-funciona" className="inicio__botao inicio__botao--contorno inicio__botao--grande">Saiba Mais</a>
            </div>
            <span className="inicio__selo">🏫 Feito para a Comunidade Escolar</span>
          </div>

          <div className="inicio__dispositivos" aria-hidden="true">
            <div className="dispositivo dispositivo--computador">
              <div className="dispositivo__tela">
                <span className="capa" style={{ background: 'var(--vermelho)' }}>MATEMÁTICA</span>
                <span className="capa" style={{ background: 'var(--azul-link)' }}>PORTUGUÊS</span>
              </div>
              <small>💻 Computador</small>
            </div>
            <div className="dispositivo dispositivo--celular">
              <div className="dispositivo__tela dispositivo__tela--grade">
                <span className="capa" style={{ background: 'var(--verde)' }} />
                <span className="capa" style={{ background: 'var(--roxo)' }} />
                <span className="capa" style={{ background: 'var(--amarelo)' }} />
                <span className="capa" style={{ background: 'var(--vermelho)' }} />
              </div>
              <small>📱 Celular</small>
            </div>
            <div className="dispositivo dispositivo--tablet">
              <div className="dispositivo__tela">
                <span className="capa capa--cheia" style={{ background: 'var(--azul-medio)' }}>📚</span>
              </div>
              <small>📋 Tablet</small>
            </div>
            <p className="inicio__dispositivos-legenda">Acesse de qualquer dispositivo</p>
          </div>
        </section>

        <section id="como-funciona" className="inicio__recursos">
          <h2>Facilite o acesso ao conhecimento</h2>
          <p>Gerenciamento completo do acervo digital para toda a comunidade escolar</p>
          <div className="inicio__cartoes">
            {RECURSOS.map(({ icone, cor, titulo, texto }) => (
              <article key={titulo} className="inicio__cartao">
                <span className="inicio__cartao-icone" style={{ background: cor }} aria-hidden="true">{icone}</span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="sobre" className="inicio__numeros" aria-label="Números do BiblioConnect">
          {usuario ? (
            <>
              <Numero valor={numeros && formatar(numeros.livros)} rotulo="Livros Disponíveis" />
              <Numero valor={numeros && formatar(numeros.alunos)} rotulo="Alunos Cadastrados" />
              <Numero valor={numeros && formatar(numeros.professores)} rotulo="Professores" />
              <Numero valor={numeros && formatar(numeros.materiais)} rotulo="Materiais no Acervo" />
            </>
          ) : (
            <p className="inicio__numeros-convite">
              Entre com a sua conta para ver os números do acervo da sua escola.
              <Link to="/login" className="inicio__botao inicio__botao--contorno">Entrar</Link>
            </p>
          )}
        </section>
      </main>

      <footer id="contato" className="inicio__rodape">
        <span>© 2026 BiblioConnect - Sistema de Biblioteca Virtual para Escolas Públicas</span>
        <small>Precisa de ajuda? Contate a secretaria da escola</small>
      </footer>
    </div>
  );
}

function Numero({ valor, rotulo }: { valor: string | null; rotulo: string }) {
  return (
    <div className="inicio__numero">
      <strong>{valor ?? '...'}</strong>
      <span>{rotulo}</span>
    </div>
  );
}
