import { useState, type InputHTMLAttributes } from 'react';

type CampoSenhaProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function CampoSenha(props: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="campo-senha">
      <input {...props} type={visivel ? 'text' : 'password'} className="input" />
      <button
        type="button"
        className="campo-senha__olho"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {visivel ? '🙈' : '👁'}
      </button>
    </div>
  );
}
