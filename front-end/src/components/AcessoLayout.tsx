import type { ReactNode } from 'react';

const LIVROS = [
  { materia: 'MATEMÁTICA', classe: 'livro--verde' },
  { materia: 'PORTUGUÊS', classe: 'livro--azul' },
  { materia: 'HISTÓRIA', classe: 'livro--roxo' },
  { materia: 'CIÊNCIAS', classe: 'livro--vermelho' },
];

//Layout dividido da tela de login (wireframe 02): painel institucional à esquerda e formulário à direita
export function AcessoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="acesso">
      <aside className="acesso__painel">
        <div className="acesso__marca">📚 BiblioConnect</div>

        <div className="acesso__livros" aria-hidden="true">
          {LIVROS.map(({ materia, classe }) => (
            <div key={materia} className={`livro ${classe}`}>
              {materia}
            </div>
          ))}
        </div>

        <h1 className="acesso__titulo">Bem-vindo!</h1>
        <p className="acesso__subtitulo">
          Acesse sua conta e continue
          <br />
          sua jornada de aprendizado.
        </p>
      </aside>

      <main className="acesso__conteudo">{children}</main>
    </div>
  );
}

interface CartaoAcessoProps {
  icone: string;
  corIcone: string;
  children: ReactNode;
}

//Cartão centralizado sobre fundo azul das telas de senha (wireframes 31 e 32)
export function CartaoAcesso({ icone, corIcone, children }: CartaoAcessoProps) {
  return (
    <div className="cartao-acesso">
      <main className="cartao-acesso__cartao">
        <header className="cartao-acesso__logo">
          <strong>📚 BiblioConnect</strong>
          <span>Sistema de Biblioteca Virtual para Escolas Públicas</span>
        </header>
        <div className="cartao-acesso__icone" style={{ background: corIcone }} aria-hidden="true">
          {icone}
        </div>
        {children}
      </main>
      <footer className="cartao-acesso__rodape">
        <span>© 2026 BiblioConnect - Sistema de Biblioteca Virtual para Escolas Públicas</span>
        <small>Precisa de ajuda? Contate a secretaria da escola</small>
      </footer>
    </div>
  );
}
