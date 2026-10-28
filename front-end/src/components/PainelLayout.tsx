import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { encerrarSessao, obterSessao } from '../api/sessao';
import { Avatar } from './Avatar';
import { rotaLoginDoPerfil } from './LoginForm';

export interface ItemMenu {
  icone: string;
  rotulo: string;
  rota?: string; //Sem rota = funcionalidade que ainda não existe no back-end
  exato?: boolean; //Destaca o item só na rota exata (ex.: o Dashboard em /admin)
}

interface PainelLayoutProps {
  area: string;
  descricaoUsuario: string;
  menu: ItemMenu[];
  titulo: string;
  acoes?: ReactNode;
  children: ReactNode;
}

//Barra lateral azul + cabeçalho branco (wireframes 10, 12, 21 e 22)
export function PainelLayout({ area, descricaoUsuario, menu, titulo, acoes, children }: PainelLayoutProps) {
  const navigate = useNavigate();
  const usuario = obterSessao();

  function sair() {
    encerrarSessao();
    navigate(usuario ? rotaLoginDoPerfil(usuario.perfil) : '/login', { replace: true });
  }

  return (
    <div className="painel">
      <aside className="painel__lateral">
        <div className="painel__marca">
          <strong>📚 BiblioConnect</strong>
          <span>{area}</span>
        </div>

        <div className="painel__usuario">
          <Avatar nome={usuario?.nome ?? ''} tamanho={44} cor="var(--laranja)" />
          <div>
            <strong>{usuario?.nome}</strong>
            <span>{descricaoUsuario}</span>
          </div>
        </div>

        <nav className="painel__menu">
          {menu.map(({ icone, rotulo, rota, exato }) =>
            rota ? (
              <NavLink key={rotulo} to={rota} end={exato} className={({ isActive }) => `menu__item ${isActive ? 'menu__item--ativo' : ''}`}>
                <span aria-hidden="true">{icone}</span> {rotulo}
              </NavLink>
            ) : (
              <span key={rotulo} className="menu__item menu__item--inativo" title="Disponível em breve">
                <span aria-hidden="true">{icone}</span> {rotulo}
                <small>em breve</small>
              </span>
            ),
          )}
        </nav>

        <button type="button" className="painel__sair" onClick={sair}>
          ↩ Sair
        </button>
      </aside>

      <div className="painel__principal">
        <header className="painel__cabecalho">
          <h1>{titulo}</h1>
          {acoes && <div className="painel__acoes">{acoes}</div>}
        </header>
        <main className="painel__conteudo">{children}</main>
      </div>
    </div>
  );
}

interface CartaoNumeroProps {
  icone?: string;
  rotulo: string;
  valor: ReactNode;
  cor: string;
  detalhe?: string;
}

//Cartões de indicadores do topo das páginas
export function CartaoNumero({ icone, rotulo, valor, cor, detalhe }: CartaoNumeroProps) {
  return (
    <div className="indicador">
      <span className="indicador__rotulo">
        {icone && <span aria-hidden="true">{icone} </span>}
        {rotulo}
      </span>
      <strong className="indicador__valor" style={{ color: cor }}>
        {valor}
      </strong>
      {detalhe && <span className="indicador__detalhe">{detalhe}</span>}
    </div>
  );
}
