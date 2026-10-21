import type { ReactNode } from 'react';

interface AuthLayoutProps {
  titulo: ReactNode;
  subtitulo: ReactNode;
  children: ReactNode;
}

const LIVROS = [
  { materia: 'MATEMÁTICA', classe: 'livro--verde' },
  { materia: 'PORTUGUÊS', classe: 'livro--azul' },
  { materia: 'HISTÓRIA', classe: 'livro--roxo' },
  { materia: 'CIÊNCIAS', classe: 'livro--vermelho' },
];

//Layout dividido das telas de acesso: painel institucional à esquerda e formulário à direita
export function AuthLayout({ titulo, subtitulo, children }: AuthLayoutProps) {
  return (
    <div className="auth">
      <aside className="auth__painel">
        <div className="auth__marca">
          <span aria-hidden="true">📚</span> BiblioConnect
        </div>

        <div className="auth__livros" aria-hidden="true">
          {LIVROS.map(({ materia, classe }) => (
            <div key={materia} className={`livro ${classe}`}>
              {materia}
            </div>
          ))}
        </div>

        <h1 className="auth__titulo">{titulo}</h1>
        <p className="auth__subtitulo">{subtitulo}</p>
      </aside>

      <main className="auth__conteudo">{children}</main>
    </div>
  );
}
