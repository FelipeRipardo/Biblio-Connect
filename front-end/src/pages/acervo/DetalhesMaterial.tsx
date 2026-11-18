import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { listarLeituras } from '../../api/leituras';
import { buscarMaterial, excluirMaterial } from '../../api/materiais';
import { obterSessao } from '../../api/sessao';
import { BotaoFavorito } from '../../components/BotaoFavorito';
import { SeloVisibilidade } from '../../components/SeloVisibilidade';
import { TopoUsuario } from '../../components/TopoUsuario';
import { useFavoritos } from '../../hooks/useFavoritos';
import type { Leitura, Material } from '../../types/api';
import {
  infoVisibilidade,
  nivelDaSerie,
  podeBaixar,
  podeGerenciarAcervo,
  rotaLeitura,
  rotaGestaoAcervo,
  rotuloCategoria,
  rotuloTipo,
  serieCurta,
  urlSegura,
  visualDisciplina,
} from '../../utils/acervo';

//O back-end devolve LocalDateTime sem fuso ("2026-11-13T10:00:00")
const dataBr = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

//Wireframe 28 - Detalhes do material, com os dados que o MaterialResponseDTO fornece
export function DetalhesMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [material, setMaterial] = useState<Material | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [capaFalhou, setCapaFalhou] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [leitura, setLeitura] = useState<Leitura | null>(null);
  const favoritos = useFavoritos();
  //Editar e excluir aparecem só para quem pode alterar o acervo (Administrador e Gestor)
  const perfil = obterSessao()?.perfil;
  const gerencia = podeGerenciarAcervo(perfil);
  const listaLivros = rotaGestaoAcervo(perfil);

  useEffect(() => {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
      setErro('Material não encontrado.');
      return;
    }
    let ativo = true;
    buscarMaterial(numero)
      .then((m) => ativo && setMaterial(m))
      .catch((err) => ativo && setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar o material.'));
    //Se o usuário já começou este material, o botão vira "Continuar leitura"
    listarLeituras()
      .then((lista) => ativo && setLeitura(lista.find((l) => l.material.id === numero) ?? null))
      .catch(() => ativo && setLeitura(null));
    return () => {
      ativo = false;
    };
  }, [id]);

  //Volta para o acervo com os filtros que estavam na URL; se a página foi aberta direto, vai para o acervo
  function voltar() {
    if (location.key !== 'default') navigate(-1);
    else navigate('/acervo');
  }

  async function compartilhar() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: material?.titulo, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setAviso('Link copiado! Quem receber precisa entrar no BiblioConnect para ver o material.');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setAviso(`Não foi possível copiar automaticamente. Link: ${url}`);
    }
  }

  async function excluir() {
    if (!material || !window.confirm(`Excluir "${material.titulo}" do acervo? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(true);
    setAviso(null);
    try {
      const resposta = await excluirMaterial(material.id);
      navigate(listaLivros, { replace: true, state: { mensagem: resposta.mensagem } });
    } catch (err) {
      setAviso(err instanceof ApiError ? err.message : 'Não foi possível excluir o material.');
      setExcluindo(false);
    }
  }

  const visual = visualDisciplina(material?.disciplina ?? '');
  const capa = capaFalhou ? null : urlSegura(material?.capaUrl);
  const arquivo = urlSegura(material?.urlArquivo);
  const baixavel = !!material && podeBaixar(material);
  const acesso = infoVisibilidade(material?.visibilidade);
  const textoLer = !leitura ? '📖 Ler Agora' : leitura.concluida ? '📖 Ler novamente' : `📖 Continuar leitura (pág. ${leitura.paginaAtual})`;
  const nivel = material?.serie ? nivelDaSerie(material.serie) : null;

  return (
    <div className="inicio">
      <TopoUsuario />

      <main className="acervo">
        <nav className="trilha" aria-label="Você está em">
          <Link to="/">Início</Link> › <Link to="/acervo">Acervo</Link> › <span aria-current="page">Detalhes do Material</span>
        </nav>

        <div>
          <button type="button" className="botao botao--secundario botao--pequeno" onClick={voltar}>← Voltar</button>
        </div>

        {erro && (
          <div className="alerta alerta--erro" role="alert">
            {erro} <Link to="/acervo">Ir para o acervo</Link>
          </div>
        )}

        {!erro && !material && <p className="vazio">Carregando material...</p>}

        {material && (
          <article className="cartao detalhes">
            <aside className="detalhes__lateral">
              <div className="detalhes__moldura">
                <div className="detalhes__capa" style={{ background: visual.cor }}>
                  {capa ? (
                    <img src={capa} alt={`Capa de ${material.titulo}`} onError={() => setCapaFalhou(true)} />
                  ) : (
                    <>
                      <strong>{(material.disciplina ?? 'Material').toUpperCase()}</strong>
                      {material.serie && <span className="detalhes__capa-serie">{serieCurta(material.serie)}</span>}
                      {nivel && <span>{nivel}</span>}
                      <span className="detalhes__capa-selo">
                        {rotuloTipo(material.tipoMaterial)}
                        <br />
                        {rotuloCategoria(material.categoria)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {arquivo ? (
                <>
                  <span className="detalhes__status">✓ Disponível para Leitura na Biblioteca</span>
                  <Link className="botao botao--verde detalhes__ler" to={rotaLeitura(material.id)}>{textoLer}</Link>
                  {baixavel ? (
                    <a className="botao detalhes__baixar" href={arquivo} target="_blank" rel="noopener noreferrer" download>
                      📥 Baixar
                    </a>
                  ) : (
                    <span className="detalhes__status detalhes__status--interno" title={acesso.descricao}>
                      🔒 Material interno: leitura somente na biblioteca
                    </span>
                  )}
                </>
              ) : (
                <span className="detalhes__status detalhes__status--indisponivel">Arquivo digital indisponível</span>
              )}
              <BotaoFavorito favorito={favoritos.ehFavorito(material.id)} titulo={material.titulo}
                onClick={() => favoritos.alternar(material.id)} desabilitado={favoritos.pendente(material.id)} />
              <button type="button" className="botao botao--secundario" onClick={compartilhar}>📤 Compartilhar</button>
              {gerencia && (
                <>
                  <Link className="botao botao--secundario" to={`${listaLivros}/${material.id}/editar`}>✏️ Editar</Link>
                  <button type="button" className="botao detalhes__excluir" onClick={excluir} disabled={excluindo}>
                    {excluindo ? 'Excluindo...' : '🗑️ Excluir'}
                  </button>
                </>
              )}
              {aviso && <small className="dica detalhes__aviso" role="status">{aviso}</small>}
              {favoritos.erro && <small className="dica detalhes__aviso" role="alert">{favoritos.erro}</small>}
            </aside>

            <div className="detalhes__info">
              <header>
                <h1>{material.titulo}</h1>
                <p>{[nivel, `${rotuloTipo(material.tipoMaterial)} digital`, rotuloCategoria(material.categoria)].filter(Boolean).join(' - ')}</p>
              </header>

              <div className="etiquetas">
                {material.disciplina && <span className="etiqueta etiqueta--azul">{material.disciplina}</span>}
                {material.serie && <span className="etiqueta etiqueta--roxo">{serieCurta(material.serie)}</span>}
                <span className="etiqueta etiqueta--verde">Digital</span>
                <SeloVisibilidade visibilidade={material.visibilidade} />
                {material.ano && <span className="etiqueta etiqueta--amarela">{material.ano}</span>}
              </div>

              <dl className="detalhes__dados">
                <div><dt>Autor(es)</dt><dd>{material.autor}</dd></div>
                <div><dt>Editora</dt><dd>{material.editora || 'Não informada'}</dd></div>
                <div><dt>ISBN</dt><dd>{material.isbn || 'Não informado'}</dd></div>
                <div><dt>Formato</dt><dd>{rotuloTipo(material.tipoMaterial)}</dd></div>
                <div><dt>Categoria</dt><dd>{rotuloCategoria(material.categoria)}</dd></div>
                <div><dt>Acesso</dt><dd>{acesso.icone} {acesso.rotulo}</dd></div>
                <div><dt>No acervo desde</dt><dd>{dataBr(material.criadoEm)}</dd></div>
              </dl>

              <section className="detalhes__secao">
                <h2>Descrição</h2>
                <p className="detalhes__descricao">{material.descricao}</p>
              </section>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
