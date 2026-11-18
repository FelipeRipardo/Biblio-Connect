import { Link } from 'react-router-dom';
import { TopoUsuario } from '../../components/TopoUsuario';
import { useFavoritos } from '../../hooks/useFavoritos';
import { CartaoMaterial } from '../acervo/Acervo';

//Materiais favoritados pelo usuário logado (GET /api/favoritos), do mais recente para o mais antigo
export function Favoritos() {
  const favoritos = useFavoritos();
  const lista = favoritos.favoritos ? [...favoritos.favoritos].sort((a, b) => b.favoritadoEm.localeCompare(a.favoritadoEm)) : null;

  return (
    <div className="inicio">
      <TopoUsuario />

      <main className="acervo">
        <div className="acervo__titulo">
          <div>
            <h1>Meus Favoritos</h1>
            <p>Os materiais que você marcou com ★ ficam guardados aqui</p>
          </div>
          <Link to="/acervo" className="botao botao--verde">📖 Explorar o acervo</Link>
        </div>

        {favoritos.erro && <div className="alerta alerta--erro" role="alert">{favoritos.erro}</div>}
        {!lista && <p className="vazio">Carregando favoritos...</p>}

        {lista && (
          <>
            <p className="acervo__contagem">
              {lista.length} {lista.length === 1 ? 'material favoritado' : 'materiais favoritados'}
            </p>
            {lista.length === 0 ? (
              <div className="cartao historico__vazio">
                <p className="vazio">Você ainda não tem favoritos. Toque na ☆ de um material no acervo para guardá-lo aqui.</p>
              </div>
            ) : (
              <div className="acervo__grade">
                {lista.map(({ material }) => (
                  <CartaoMaterial key={material.id} material={material} favorito
                    favoritando={favoritos.pendente(material.id)} onFavoritar={() => favoritos.alternar(material.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
