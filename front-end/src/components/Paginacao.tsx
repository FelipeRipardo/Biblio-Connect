interface PaginacaoProps {
  pagina: number;
  total: number;
  porPagina: number;
  rotulo: string;
  onChange: (pagina: number) => void;
}

//"Mostrando 1-7 de 45 professores" + botões de página (wireframes 21 e 22)
export function Paginacao({ pagina, total, porPagina, rotulo, onChange }: PaginacaoProps) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(total, pagina * porPagina);

  return (
    <div className="paginacao">
      <span>
        Mostrando {inicio}-{fim} de {total} {rotulo}
      </span>
      {paginas > 1 && (
        <div className="paginacao__botoes">
          <button type="button" disabled={pagina === 1} onClick={() => onChange(pagina - 1)} aria-label="Página anterior">
            ‹
          </button>
          {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={n === pagina ? 'paginacao__atual' : ''}
              aria-current={n === pagina ? 'page' : undefined}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          ))}
          <button type="button" disabled={pagina === paginas} onClick={() => onChange(pagina + 1)} aria-label="Próxima página">
            ›
          </button>
        </div>
      )}
    </div>
  );
}
