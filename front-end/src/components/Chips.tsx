import { useState, type KeyboardEvent } from 'react';

interface ChipsProps {
  valores: string[];
  onChange: (valores: string[]) => void;
  cor: string;
  opcoes?: string[]; //Quando informado, o "+ Adicionar" vira uma lista de seleção
  placeholder?: string;
  maxCaracteres?: number; //Limite da coluna no banco para a lista unida por ", "
}

//Lista de etiquetas removíveis com "+ Adicionar" (disciplinas e turmas, wireframes 04 e 19)
export function Chips({ valores, onChange, cor, opcoes, placeholder = 'Digite e tecle Enter', maxCaracteres = 255 }: ChipsProps) {
  const [texto, setTexto] = useState('');

  function adicionar(valor: string) {
    const limpo = valor.trim();
    if (!limpo || valores.includes(limpo)) return;
    if ([...valores, limpo].join(', ').length > maxCaracteres) return;
    onChange([...valores, limpo]);
    setTexto('');
  }

  function aoTeclar(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      adicionar(texto);
    }
  }

  const disponiveis = opcoes?.filter((o) => !valores.includes(o));

  return (
    <div className="chips">
      {valores.map((v) => (
        <span key={v} className="chip" style={{ background: cor }}>
          {v}
          <button type="button" onClick={() => onChange(valores.filter((x) => x !== v))} aria-label={`Remover ${v}`}>
            ✕
          </button>
        </span>
      ))}

      {disponiveis ? (
        disponiveis.length > 0 && (
          <select className="chip chip--adicionar" value="" onChange={(e) => adicionar(e.target.value)} aria-label="Adicionar">
            <option value="">+ Adicionar</option>
            {disponiveis.map((o) => <option key={o}>{o}</option>)}
          </select>
        )
      ) : (
        <span className="chip chip--adicionar chip--texto">
          <input
            value={texto}
            placeholder={placeholder}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={aoTeclar}
            onBlur={() => adicionar(texto)}
            aria-label="Adicionar"
          />
          <button type="button" onClick={() => adicionar(texto)}>+ Adicionar</button>
        </span>
      )}
    </div>
  );
}
