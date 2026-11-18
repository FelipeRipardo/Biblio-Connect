interface BotaoFavoritoProps {
  favorito: boolean;
  titulo: string;
  onClick: () => void;
  desabilitado?: boolean;
  compacto?: boolean; //Só a estrela, sobre a capa dos cartões do acervo
}

//Estrela para favoritar/remover dos favoritos um material
export function BotaoFavorito({ favorito, titulo, onClick, desabilitado, compacto }: BotaoFavoritoProps) {
  const rotulo = favorito ? `Remover "${titulo}" dos favoritos` : `Adicionar "${titulo}" aos favoritos`;
  return (
    <button
      type="button"
      className={`favorito ${compacto ? 'favorito--compacto' : 'botao botao--secundario'} ${favorito ? 'favorito--ativo' : ''}`}
      aria-pressed={favorito}
      aria-label={rotulo}
      title={rotulo}
      onClick={onClick}
      disabled={desabilitado}
    >
      <span aria-hidden="true">{favorito ? '★' : '☆'}</span>
      {!compacto && (favorito ? ' Favoritado' : ' Favoritar')}
    </button>
  );
}

