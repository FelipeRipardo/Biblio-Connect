import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { listarMateriais } from '../../api/materiais';
import { obterSessao } from '../../api/sessao';
import { Paginacao } from '../../components/Paginacao';
import { TopoUsuario } from '../../components/TopoUsuario';
import type { CategoriaMaterial, Material } from '../../types/api';
import { CATEGORIAS, rotuloCategoria, serieCurta, urlSegura, visualDisciplina } from '../../utils/acervo';
import { DISCIPLINAS, SERIES } from '../../utils/escola';

const POR_PAGINA = 12;

type Ordem = 'AZ' | 'ZA' | 'RECENTES' | 'ANO';

//O back-end já devolve em ordem alfabética; as demais ordens são feitas aqui
const ORDENAR: Record<Ordem, (a: Material, b: Material) => number> = {
  AZ: (a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'),
  ZA: (a, b) => b.titulo.localeCompare(a.titulo, 'pt-BR'),
  RECENTES: (a, b) => b.criadoEm.localeCompare(a.criadoEm),
  ANO: (a, b) => (b.ano ?? 0) - (a.ano ?? 0),
};

//Wireframe 06 - Navegação do acervo (qualquer perfil logado)
//Filtros, ordem e página ficam na URL para sobreviverem à ida e volta da tela de detalhes
export function Acervo() {
  const sessao = obterSessao()!;
  const [params, setParams] = useSearchParams();
  const termo = params.get('termo') ?? '';
  const categoria = params.get('categoria') ?? '';
  const serie = params.get('serie') ?? '';
  const disciplina = params.get('disciplina') ?? '';
  const ordem = (params.get('ordem') ?? '') in ORDENAR ? (params.get('ordem') as Ordem) : 'AZ';
  const pagina = Math.max(1, Number(params.get('pagina')) || 1);

  const [busca, setBusca] = useState(termo);
  const [materiais, setMateriais] = useState<Material[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setMateriais(null);
    setErro(null);
    listarMateriais({ termo, categoria: (categoria || undefined) as CategoriaMaterial | undefined, serie, disciplina })
      .then((lista) => ativo && setMateriais(lista))
      .catch((err) => ativo && setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar o acervo.'));
    return () => {
      ativo = false;
    };
  }, [termo, categoria, serie, disciplina]);

  const ordenados = useMemo(() => (materiais ? [...materiais].sort(ORDENAR[ordem]) : []), [materiais, ordem]);
  const visiveis = ordenados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  //Qualquer mudança de filtro volta para a primeira página
  function atualizar(novos: Record<string, string | undefined>) {
    setParams(
      (atuais) => {
        const proximos = new URLSearchParams(atuais);
        if (!('pagina' in novos)) proximos.delete('pagina');
        for (const [chave, valor] of Object.entries(novos)) {
          if (valor) proximos.set(chave, valor);
          else proximos.delete(chave);
        }
        return proximos;
      },
      { replace: true },
    );
  }

  function buscar(e: FormEvent) {
    e.preventDefault();
    atualizar({ termo: busca.trim() || undefined });
  }

  return (
    <div className="inicio">
      <TopoUsuario />

      <main className="acervo">
        <div className="acervo__titulo">
          <div>
            <h1>Acervo Digital</h1>
            <p>Explore nossa biblioteca virtual de materiais educacionais</p>
          </div>
          {sessao.perfil === 'ADMINISTRADOR' && (
            <Link to="/admin/livros/novo" className="botao botao--verde">+ Novo Livro</Link>
          )}
        </div>

        <div className="acervo__filtros">
          <form className="acervo__busca" onSubmit={buscar} role="search">
            <input
              className="input"
              type="search"
              placeholder="🔍 Buscar por título ou autor..."
              aria-label="Buscar por título ou autor"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button type="submit" className="botao botao--verde botao--pequeno">Buscar</button>
          </form>

          <select className="input acervo__select" aria-label="Categoria" value={categoria}
            onChange={(e) => atualizar({ categoria: e.target.value || undefined })}>
            <option value="">📚 Categoria</option>
            {CATEGORIAS.map(({ valor, rotulo }) => <option key={valor} value={valor}>{rotulo}</option>)}
          </select>

          <select className="input acervo__select" aria-label="Série/Ano" value={serie}
            onChange={(e) => atualizar({ serie: e.target.value || undefined })}>
            <option value="">📅 Ano</option>
            {SERIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className="input acervo__select" aria-label="Ordenar" value={ordem}
            onChange={(e) => atualizar({ ordem: e.target.value === 'AZ' ? undefined : e.target.value })}>
            <option value="AZ">🔤 A-Z</option>
            <option value="ZA">🔤 Z-A</option>
            <option value="RECENTES">🆕 Mais recentes</option>
            <option value="ANO">📅 Ano de publicação</option>
          </select>
        </div>

        <nav className="acervo__pilulas" aria-label="Disciplinas">
          {['', ...DISCIPLINAS].map((d) => (
            <button
              key={d || 'todos'}
              type="button"
              className={`pilula ${disciplina === d ? 'pilula--ativa' : ''}`}
              aria-pressed={disciplina === d}
              onClick={() => atualizar({ disciplina: d || undefined })}
            >
              {d || 'Todos'}
            </button>
          ))}
        </nav>

        {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

        {!erro && !materiais && <p className="vazio">Carregando acervo...</p>}

        {materiais && (
          <>
            <p className="acervo__contagem">
              Exibindo {materiais.length} {materiais.length === 1 ? 'material disponível' : 'materiais disponíveis'}
            </p>

            {materiais.length === 0 ? (
              <p className="vazio">Nenhum material encontrado com esses filtros.</p>
            ) : (
              <div className="acervo__grade">
                {visiveis.map((m) => <CartaoMaterial key={m.id} material={m} />)}
              </div>
            )}

            {materiais.length > POR_PAGINA && (
              <Paginacao pagina={pagina} total={materiais.length} porPagina={POR_PAGINA} rotulo="materiais"
                onChange={(n) => atualizar({ pagina: n > 1 ? String(n) : undefined })} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function CartaoMaterial({ material }: { material: Material }) {
  const { cor, icone } = visualDisciplina(material.disciplina ?? '');
  const [capaFalhou, setCapaFalhou] = useState(false);
  const capa = capaFalhou ? null : urlSegura(material.capaUrl);
  const arquivo = urlSegura(material.urlArquivo);
  const detalhes = `/acervo/${material.id}`;

  return (
    <article className="material">
      <Link to={detalhes} className="material__capa" style={{ background: cor }} aria-label={`Ver detalhes de ${material.titulo}`}>
        {capa ? (
          <img src={capa} alt="" loading="lazy" onError={() => setCapaFalhou(true)} />
        ) : (
          <>
            <strong>{(material.disciplina ?? 'Material').toUpperCase()}</strong>
            {material.serie && <span>{serieCurta(material.serie)}</span>}
            <span className="material__icone" aria-hidden="true">{icone}</span>
          </>
        )}
      </Link>

      <h2 className="material__titulo">
        <Link to={detalhes}>{material.titulo}</Link>
      </h2>
      <span className="material__autor">{material.autor}</span>

      <div className="etiquetas">
        {material.disciplina && (
          <span className="etiqueta" style={{ background: `color-mix(in srgb, ${cor} 14%, #fff)`, color: cor }}>
            {material.disciplina}
          </span>
        )}
        <span className="etiqueta etiqueta--cinza">{rotuloCategoria(material.categoria)}</span>
      </div>

      {arquivo ? (
        <a className="botao botao--verde botao--pequeno material__ler" href={arquivo} target="_blank" rel="noopener noreferrer">
          📖 Ler Agora
        </a>
      ) : (
        <span className="botao botao--secundario botao--pequeno material__ler" aria-disabled="true">Arquivo indisponível</span>
      )}
    </article>
  );
}
