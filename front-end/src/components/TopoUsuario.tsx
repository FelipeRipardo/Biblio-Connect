import { Link, useNavigate } from 'react-router-dom';
import { encerrarSessao, obterSessao } from '../api/sessao';
import { Avatar } from './Avatar';
import { destinoDoPerfil } from './LoginForm';

//Barra azul das telas do acervo (wireframes 06 e 28): marca à esquerda e usuário logado à direita
export function TopoUsuario() {
  const navigate = useNavigate();
  const sessao = obterSessao()!;

  function sair() {
    encerrarSessao();
    navigate('/', { replace: true });
  }

  return (
    <header className="inicio__topo acervo__topo">
      <Link to="/" className="inicio__marca">📚 BiblioConnect</Link>
      <div className="inicio__conta">
        <Link to={destinoDoPerfil(sessao.perfil)} className="inicio__botao inicio__botao--contorno">Meu painel</Link>
        <span className="inicio__ola">{sessao.nome}</span>
        <Avatar nome={sessao.nome} id={sessao.id} tamanho={36} cor="var(--verde)" />
        <button type="button" className="inicio__botao inicio__botao--contorno" onClick={sair}>Sair</button>
      </div>
    </header>
  );
}
