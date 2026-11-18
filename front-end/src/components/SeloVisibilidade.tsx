import type { Visibilidade } from '../types/api';
import { infoVisibilidade } from '../utils/acervo';

//Etiqueta "Público" ou "Interno", com a explicação no title
export function SeloVisibilidade({ visibilidade }: { visibilidade: Visibilidade | null | undefined }) {
  const { rotulo, icone, descricao, etiqueta } = infoVisibilidade(visibilidade);
  return (
    <span className={`etiqueta ${etiqueta}`} title={descricao}>
      <span aria-hidden="true">{icone}</span> {rotulo}
    </span>
  );
}
