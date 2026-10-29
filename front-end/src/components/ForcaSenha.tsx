import { REQUISITOS_SENHA, pontosSenha, senhaForte } from '../utils/senha';

const NIVEIS = [
  { texto: 'Fraca', cor: 'var(--vermelho)' },
  { texto: 'Média', cor: 'var(--amarelo)' },
  { texto: 'Forte ✓', cor: 'var(--verde)' },
];

//Barra de força da senha (wireframes 03, 04 e 32)
export function ForcaSenha({ senha }: { senha: string }) {
  if (!senha) return null;
  const pontos = pontosSenha(senha);
  const nivel = senhaForte(senha) ? NIVEIS[2] : pontos >= 3 ? NIVEIS[1] : NIVEIS[0];
  const barrasCheias = senhaForte(senha) ? 4 : Math.min(3, Math.floor((pontos * 4) / REQUISITOS_SENHA.length));

  return (
    <div className="forca" aria-live="polite">
      <div className="forca__barras">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={i < barrasCheias ? { background: nivel.cor } : undefined} />
        ))}
      </div>
      <span className="forca__texto" style={{ color: nivel.cor }}>
        Força da senha: {nivel.texto}
      </span>
    </div>
  );
}

//Lista de requisitos marcados conforme a senha digitada (wireframe 32)
export function RequisitosSenha({ senha }: { senha: string }) {
  return (
    <ul className="requisitos">
      {REQUISITOS_SENHA.map(({ rotulo, atende }) => (
        <li key={rotulo} className={atende(senha) ? 'requisitos--ok' : ''}>
          {atende(senha) ? '✓' : '○'} {rotulo}
        </li>
      ))}
    </ul>
  );
}
