import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import { registrarAcesso } from '../../../api/historico';
import { ApiError } from '../../../api/http';
import { buscarMaterial } from '../../../api/materiais';
import { obterSessao } from '../../../api/sessao';
import { BotaoFavorito } from '../../../components/BotaoFavorito';
import { useFavoritos } from '../../../hooks/useFavoritos';
import type { Material } from '../../../types/api';
import { podeBaixar, urlSegura } from '../../../utils/acervo';
import { carregarLeitura, salvarLeitura, type Marcador } from '../../../utils/marcadores';
import { PaginaPdf } from './PaginaPdf';
import '../../../styles/leitor-biblioteca.css';

type Painel = 'sumario' | 'marcadores' | 'busca';
type Tema = 'claro' | 'sepia' | 'escuro';

interface ItemSumario {
  titulo: string;
  pagina: number | null;
  filhos: ItemSumario[];
}

interface ResultadoBusca {
  pagina: number;
  antes: string;
  trecho: string;
  depois: string;
}

const CHAVE_TEMA = 'biblioconnect.leitor.tema';
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3;
const MAX_RESULTADOS = 200;

//Busca sem diferenciar maiúsculas e acentos ("matematica" encontra "Matemática")
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const dataBr = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

//Versão do texto para comparar (sem acentos, minúscula) e a posição de cada letra dela no texto original,
//para mostrar o trecho encontrado com os acentos de verdade
function indexarTexto(texto: string) {
  const original = texto.normalize('NFD');
  let comparavel = '';
  const posicoes: number[] = [];
  for (let i = 0; i < original.length; i++) {
    const letra = original[i];
    if (/[̀-ͯ]/.test(letra)) continue;
    comparavel += letra.toLowerCase();
    posicoes.push(i);
  }
  posicoes.push(original.length); //Posição do fim, para cortar até o último caractere
  return { comparavel, posicoes, original };
}

//Leitor da biblioteca, no estilo da Minha Biblioteca: o livro abre dentro do sistema, sem nova aba.
//O PDF é desenhado pelo pdf.js; sumário, busca, zoom, temas, tela cheia e marcadores ficam na própria tela.
//A página onde o usuário parou e os marcadores ficam no navegador (utils/marcadores), pois o back-end ainda não os guarda.
export function LeitorBiblioteca() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sessao = obterSessao()!;
  const favoritos = useFavoritos();
  const materialId = Number(id);

  const [material, setMaterial] = useState<Material | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [falhaPdf, setFalhaPdf] = useState(false);
  const [base, setBase] = useState<{ largura: number; altura: number } | null>(null);

  const leituraSalva = useMemo(() => carregarLeitura(sessao.id, materialId), [sessao.id, materialId]);
  const [pagina, setPagina] = useState(leituraSalva.ultimaPagina);
  const [marcadores, setMarcadores] = useState<Marcador[]>(leituraSalva.marcadores);
  const [retomada, setRetomada] = useState(leituraSalva.ultimaPagina > 1);
  const [campoPagina, setCampoPagina] = useState(String(leituraSalva.ultimaPagina));

  const [zoom, setZoom] = useState<number | null>(null); //null = ajustar à largura
  const [larguraArea, setLarguraArea] = useState(0);
  const [painel, setPainel] = useState<Painel | null>(() => (window.innerWidth > 900 ? 'sumario' : null));
  const [tema, setTema] = useState<Tema>(() => (localStorage.getItem(CHAVE_TEMA) as Tema) || 'claro');
  const [telaCheia, setTelaCheia] = useState(false);

  const [sumario, setSumario] = useState<ItemSumario[] | null>(null);
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<ResultadoBusca[] | null>(null);
  const [buscando, setBuscando] = useState<string | null>(null);

  const raiz = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const paginas = useRef(new Map<number, HTMLDivElement>());
  const textos = useRef(new Map<number, string>());
  const buscaAtual = useRef(0);
  const posicionado = useRef(false);

  const total = pdf?.numPages ?? 0;
  const arquivo = urlSegura(material?.urlArquivo);
  const baixavel = !!material && podeBaixar(material);

  //Material + registro do acesso no histórico (POST /api/historico/{id})
  useEffect(() => {
    if (!Number.isInteger(materialId) || materialId <= 0) {
      setErro('Material não encontrado.');
      return;
    }
    let ativo = true;
    buscarMaterial(materialId)
      .then((m) => {
        if (!ativo) return;
        setMaterial(m);
        if (urlSegura(m.urlArquivo)) registrarAcesso(m.id);
      })
      .catch((err) => ativo && setErro(err instanceof ApiError ? err.message : 'Não foi possível abrir o material.'));
    return () => {
      ativo = false;
    };
  }, [materialId]);

  //Abre o PDF com o pdf.js (carregado só nesta tela, para não pesar o restante do sistema)
  useEffect(() => {
    if (!arquivo) return;
    let ativo = true;
    let tarefa: PDFDocumentLoadingTask | null = null;
    (async () => {
      try {
        const [pdfjs, { default: worker }] = await Promise.all([
          import('pdfjs-dist'),
          import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
        ]);
        if (!ativo) return;
        pdfjs.GlobalWorkerOptions.workerSrc = worker;
        tarefa = pdfjs.getDocument({ url: arquivo });
        const documento = await tarefa.promise;
        const primeira = (await documento.getPage(1)).getViewport({ scale: 1 });
        if (!ativo) return;
        setBase({ largura: primeira.width, altura: primeira.height });
        setPdf(documento);
      } catch {
        //Sites que não liberam o arquivo para outros endereços (CORS) caem no visualizador do navegador, ainda dentro do sistema
        if (ativo) setFalhaPdf(true);
      }
    })();
    return () => {
      ativo = false;
      tarefa?.destroy(); //Fecha o arquivo e o worker ao sair do leitor
    };
  }, [arquivo]);

  //Sumário do próprio PDF (quando o arquivo tem um)
  useEffect(() => {
    if (!pdf) return;
    let ativo = true;
    const paginaDoDestino = async (destino: unknown): Promise<number | null> => {
      try {
        const explicito = typeof destino === 'string' ? await pdf.getDestination(destino) : (destino as unknown[] | null);
        if (!explicito?.length) return null;
        const alvo = explicito[0];
        if (typeof alvo === 'number') return alvo + 1;
        return (await pdf.getPageIndex(alvo as Parameters<PDFDocumentProxy['getPageIndex']>[0])) + 1;
      } catch {
        return null;
      }
    };
    const converter = async (itens: Awaited<ReturnType<PDFDocumentProxy['getOutline']>>): Promise<ItemSumario[]> =>
      Promise.all(
        (itens ?? []).map(async (item) => ({
          titulo: item.title,
          pagina: await paginaDoDestino(item.dest),
          filhos: await converter(item.items),
        })),
      );
    pdf
      .getOutline()
      .then(converter)
      .then((itens) => ativo && setSumario(itens))
      .catch(() => ativo && setSumario([]));
    return () => {
      ativo = false;
    };
  }, [pdf]);

  //Largura disponível, para o modo "ajustar à largura"
  useEffect(() => {
    const elemento = area.current;
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => setLarguraArea(entrada.contentRect.width));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [pdf]);

  const ajusteLargura = base && larguraArea ? Math.min(Math.max((larguraArea - 48) / base.largura, ZOOM_MIN), 1.25) : 1;
  const escala = zoom ?? ajusteLargura;

  const registrarPagina = useCallback((numero: number, elemento: HTMLDivElement | null) => {
    if (elemento) paginas.current.set(numero, elemento);
    else paginas.current.delete(numero);
  }, []);

  const rolarPara = useCallback((numero: number, suave = false) => {
    const elemento = paginas.current.get(numero);
    const container = area.current;
    if (!elemento || !container) return;
    container.scrollTo({ top: elemento.offsetTop - 16, behavior: suave ? 'smooth' : 'auto' });
  }, []);

  const irPara = useCallback(
    (numero: number) => {
      if (!total || !Number.isFinite(numero)) return;
      const destino = Math.min(Math.max(1, Math.trunc(numero)), total);
      setPagina(destino);
      setCampoPagina(String(destino));
      setRetomada(false);
      rolarPara(destino);
      if (window.innerWidth <= 900) setPainel(null); //No celular o painel cobre o livro
    },
    [total, rolarPara],
  );

  //Abre na página onde o usuário parou
  useLayoutEffect(() => {
    if (!pdf || !base || !larguraArea || posicionado.current) return;
    posicionado.current = true;
    const inicial = Math.min(leituraSalva.ultimaPagina, pdf.numPages);
    setPagina(inicial);
    setCampoPagina(String(inicial));
    rolarPara(inicial);
  }, [pdf, base, larguraArea, leituraSalva.ultimaPagina, rolarPara]);

  //Ao mudar o zoom, continua na mesma página
  const paginaAtual = useRef(pagina);
  paginaAtual.current = pagina;
  useLayoutEffect(() => {
    if (posicionado.current) rolarPara(paginaAtual.current);
  }, [escala, rolarPara]);

  //Descobre a página atual pela rolagem
  const quadro = useRef(0);
  function aoRolar() {
    cancelAnimationFrame(quadro.current);
    quadro.current = requestAnimationFrame(() => {
      const container = area.current;
      if (!container || !posicionado.current) return;
      const linha = container.scrollTop + container.clientHeight * 0.35;
      let atual = 1;
      for (let n = 1; n <= total; n++) {
        const elemento = paginas.current.get(n);
        if (elemento && elemento.offsetTop <= linha) atual = n;
        else if (elemento) break;
      }
      if (atual !== paginaAtual.current) {
        setPagina(atual);
        setCampoPagina(String(atual));
      }
    });
  }

  //Guarda a posição e os marcadores a cada mudança
  useEffect(() => {
    if (!pdf) return;
    salvarLeitura(sessao.id, materialId, { ultimaPagina: pagina, totalPaginas: pdf.numPages, marcadores });
  }, [pdf, pagina, marcadores, sessao.id, materialId]);

  const alterarZoom = useCallback(
    (fator: number) => setZoom((atual) => Math.min(Math.max((atual ?? ajusteLargura) * fator, ZOOM_MIN), ZOOM_MAX)),
    [ajusteLargura],
  );

  //Atalhos: ← → trocam de página, + e - mudam o zoom
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement;
      if (alvo.closest('input, textarea, select') || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'ArrowRight') irPara(paginaAtual.current + 1);
      else if (e.key === 'ArrowLeft') irPara(paginaAtual.current - 1);
      else if (e.key === '+' || e.key === '=') alterarZoom(1.15);
      else if (e.key === '-') alterarZoom(1 / 1.15);
      else return;
      e.preventDefault();
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [irPara, alterarZoom]);

  useEffect(() => {
    const aoMudar = () => setTelaCheia(document.fullscreenElement === raiz.current);
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);

  function alternarTelaCheia() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else raiz.current?.requestFullscreen().catch(() => undefined);
  }

  function trocarTema(novo: Tema) {
    setTema(novo);
    localStorage.setItem(CHAVE_TEMA, novo);
  }

  const marcada = marcadores.some((m) => m.pagina === pagina);
  function alternarMarcador() {
    setMarcadores((atuais) =>
      marcada
        ? atuais.filter((m) => m.pagina !== pagina)
        : [...atuais, { pagina, criadoEm: new Date().toISOString() }].sort((a, b) => a.pagina - b.pagina),
    );
  }

  //Título da seção do sumário onde a página está (para identificar os marcadores)
  const secoes = useMemo(() => {
    const lista: { titulo: string; pagina: number }[] = [];
    const percorrer = (itens: ItemSumario[]) =>
      itens.forEach((item) => {
        if (item.pagina) lista.push({ titulo: item.titulo, pagina: item.pagina });
        percorrer(item.filhos);
      });
    percorrer(sumario ?? []);
    return lista.sort((a, b) => a.pagina - b.pagina);
  }, [sumario]);
  const secaoDa = (numero: number) => [...secoes].reverse().find((s) => s.pagina <= numero)?.titulo;

  async function buscar(e: FormEvent) {
    e.preventDefault();
    const procurado = normalizar(termo.trim());
    if (!pdf || procurado.length < 2) return;
    const execucao = ++buscaAtual.current;
    const encontrados: ResultadoBusca[] = [];
    setResultados([]);
    for (let n = 1; n <= pdf.numPages && encontrados.length < MAX_RESULTADOS; n++) {
      if (buscaAtual.current !== execucao) return; //Uma busca nova começou
      setBuscando(`Buscando... página ${n} de ${pdf.numPages}`);
      let texto = textos.current.get(n);
      if (texto === undefined) {
        const conteudo = await (await pdf.getPage(n)).getTextContent();
        texto = conteudo.items.map((item) => ('str' in item ? item.str : '')).join(' ').replace(/\s+/g, ' ');
        textos.current.set(n, texto);
      }
      const { comparavel, posicoes, original } = indexarTexto(texto);
      const trecho = (de: number, ate: number) =>
        original.slice(posicoes[Math.max(0, Math.min(de, posicoes.length - 1))], posicoes[Math.min(ate, posicoes.length - 1)]).normalize('NFC');
      let inicio = comparavel.indexOf(procurado);
      while (inicio >= 0 && encontrados.length < MAX_RESULTADOS) {
        const fim = inicio + procurado.length;
        encontrados.push({
          pagina: n,
          antes: trecho(inicio - 40, inicio),
          trecho: trecho(inicio, fim),
          depois: trecho(fim, fim + 60),
        });
        inicio = comparavel.indexOf(procurado, fim);
      }
      if (n % 10 === 0) setResultados([...encontrados]);
    }
    if (buscaAtual.current !== execucao) return;
    setResultados(encontrados);
    setBuscando(null);
  }

  function voltar() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    if (location.key !== 'default') navigate(-1);
    else navigate(`/acervo/${materialId}`);
  }

  const percentual = total ? Math.round((pagina / total) * 100) : 0;
  const alternarPainel = (novo: Painel) => setPainel((atual) => (atual === novo ? null : novo));

  if (erro || (material && !arquivo)) {
    return (
      <div className="leitor-bib leitor-bib--mensagem">
        <div className="cartao">
          <p>{erro ?? 'Este material ainda não tem arquivo digital disponível.'}</p>
          <Link to={material ? `/acervo/${material.id}` : '/acervo'} className="botao botao--verde">Voltar</Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={raiz} className={`leitor-bib leitor-bib--${tema}`}>
      <header className="leitor-bib__topo">
        <button type="button" className="leitor-bib__icone" onClick={voltar} title="Sair do leitor" aria-label="Sair do leitor">
          ←
        </button>
        <button
          type="button"
          className={`leitor-bib__icone ${painel ? 'leitor-bib__icone--ativo' : ''}`}
          onClick={() => setPainel((atual) => (atual ? null : 'sumario'))}
          title="Sumário, marcadores e busca"
          aria-label="Mostrar ou esconder o painel lateral"
          aria-expanded={!!painel}
          disabled={!pdf}
        >
          ☰
        </button>
        <div className="leitor-bib__titulo">
          <strong>{material?.titulo ?? 'Abrindo...'}</strong>
          {material && <span>{material.autor}</span>}
        </div>

        {pdf && (
          <div className="leitor-bib__ferramentas">
            <div className="leitor-bib__grupo" role="group" aria-label="Zoom">
              <button type="button" className="leitor-bib__icone" onClick={() => alterarZoom(1 / 1.15)} title="Diminuir zoom (-)" aria-label="Diminuir zoom">−</button>
              <button type="button" className="leitor-bib__zoom" onClick={() => setZoom(null)} title="Ajustar à largura">
                {Math.round(escala * 100)}%
              </button>
              <button type="button" className="leitor-bib__icone" onClick={() => alterarZoom(1.15)} title="Aumentar zoom (+)" aria-label="Aumentar zoom">+</button>
            </div>
            <div className="leitor-bib__grupo leitor-bib__temas" role="group" aria-label="Cor da página">
              {(['claro', 'sepia', 'escuro'] as Tema[]).map((t) => (
                <button key={t} type="button" className={`leitor-bib__tema leitor-bib__tema--${t} ${tema === t ? 'leitor-bib__tema--ativo' : ''}`}
                  onClick={() => trocarTema(t)} aria-pressed={tema === t} title={{ claro: 'Página clara', sepia: 'Página sépia', escuro: 'Modo noturno' }[t]}>
                  A
                </button>
              ))}
            </div>
            <button type="button" className={`leitor-bib__icone ${marcada ? 'leitor-bib__icone--marcado' : ''}`} onClick={alternarMarcador}
              title={marcada ? 'Remover marcador desta página' : 'Marcar esta página'} aria-pressed={marcada} aria-label="Marcador da página">
              🔖
            </button>
            <button type="button" className="leitor-bib__icone" onClick={alternarTelaCheia} title={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'} aria-label="Tela cheia">
              {telaCheia ? '🗗' : '⛶'}
            </button>
          </div>
        )}

        {material && (
          <div className="leitor-bib__conta">
            <BotaoFavorito compacto favorito={favoritos.ehFavorito(material.id)} titulo={material.titulo}
              onClick={() => favoritos.alternar(material.id)} desabilitado={favoritos.pendente(material.id)} />
            {baixavel && arquivo && (
              <a className="leitor-bib__icone" href={arquivo} download target="_blank" rel="noopener noreferrer" title="Baixar" aria-label="Baixar">📥</a>
            )}
          </div>
        )}
      </header>

      <div className="leitor-bib__corpo">
        {painel && pdf && (
          <aside className="leitor-bib__painel" aria-label="Navegação do livro">
            <div className="leitor-bib__abas" role="tablist">
              {([['sumario', 'Sumário'], ['marcadores', `Marcadores (${marcadores.length})`], ['busca', 'Buscar']] as [Painel, string][]).map(([valor, rotulo]) => (
                <button key={valor} type="button" role="tab" aria-selected={painel === valor}
                  className={`leitor-bib__aba ${painel === valor ? 'leitor-bib__aba--ativa' : ''}`} onClick={() => alternarPainel(valor)}>
                  {rotulo}
                </button>
              ))}
            </div>

            <div className="leitor-bib__conteudo-painel">
              {painel === 'sumario' && (
                sumario === null ? <p className="leitor-bib__vazio">Carregando sumário...</p>
                  : sumario.length === 0 ? (
                    <>
                      <p className="leitor-bib__vazio">Este arquivo não tem sumário. Navegue pelas páginas:</p>
                      <ul className="leitor-bib__lista">
                        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                          <li key={n}>
                            <button type="button" className={`leitor-bib__item ${n === pagina ? 'leitor-bib__item--atual' : ''}`} onClick={() => irPara(n)}>
                              Página {n}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : <Sumario itens={sumario} paginaAtual={pagina} irPara={irPara} />
              )}

              {painel === 'marcadores' && (
                marcadores.length === 0 ? (
                  <p className="leitor-bib__vazio">Nenhum marcador ainda. Use o 🔖 no topo para marcar a página que está lendo.</p>
                ) : (
                  <ul className="leitor-bib__lista">
                    {marcadores.map((m) => (
                      <li key={m.pagina} className="leitor-bib__marcador">
                        <button type="button" className={`leitor-bib__item ${m.pagina === pagina ? 'leitor-bib__item--atual' : ''}`} onClick={() => irPara(m.pagina)}>
                          <strong>🔖 Página {m.pagina}</strong>
                          {secaoDa(m.pagina) && <span>{secaoDa(m.pagina)}</span>}
                          <small>Marcado em {dataBr(m.criadoEm)}</small>
                        </button>
                        <button type="button" className="leitor-bib__remover" aria-label={`Remover marcador da página ${m.pagina}`} title="Remover marcador"
                          onClick={() => setMarcadores((atuais) => atuais.filter((x) => x.pagina !== m.pagina))}>
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              )}

              {painel === 'busca' && (
                <>
                  <form className="leitor-bib__busca" onSubmit={buscar} role="search">
                    <input className="input" type="search" placeholder="Buscar no livro..." value={termo} onChange={(e) => setTermo(e.target.value)} aria-label="Buscar no livro" />
                    <button type="submit" className="botao botao--verde botao--pequeno" disabled={termo.trim().length < 2}>Buscar</button>
                  </form>
                  {buscando && <p className="leitor-bib__vazio" role="status">{buscando}</p>}
                  {resultados && !buscando && (
                    <p className="leitor-bib__vazio" role="status">
                      {resultados.length === 0 ? 'Nenhum resultado.' : `${resultados.length}${resultados.length >= MAX_RESULTADOS ? '+' : ''} resultado(s)`}
                    </p>
                  )}
                  <ul className="leitor-bib__lista">
                    {resultados?.map((r, i) => (
                      <li key={`${r.pagina}-${i}`}>
                        <button type="button" className="leitor-bib__item leitor-bib__resultado" onClick={() => irPara(r.pagina)}>
                          <small>Página {r.pagina}</small>
                          <span>…{r.antes}<mark>{r.trecho}</mark>{r.depois}…</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </aside>
        )}

        <main className="leitor-bib__leitura">
          {retomada && pdf && (
            <div className="leitor-bib__aviso" role="status">
              Continuando de onde você parou: página {pagina}.
              <button type="button" onClick={() => irPara(1)}>Ir para o início</button>
              <button type="button" onClick={() => setRetomada(false)} aria-label="Fechar aviso">✕</button>
            </div>
          )}

          {!pdf && !falhaPdf && <p className="leitor-bib__estado">Abrindo o livro...</p>}

          {falhaPdf && arquivo && (
            //O site do arquivo não permite que o leitor o carregue: usa o visualizador do navegador, ainda dentro do sistema
            <div className="leitor-bib__alternativo">
              <p className="leitor-bib__aviso">
                Este arquivo não pôde ser aberto no leitor completo; exibindo no visualizador do navegador (sem sumário, busca e marcadores).
              </p>
              <iframe src={`${arquivo}#page=${pagina}${baixavel ? '' : '&toolbar=0&navpanes=0'}`} title={`Leitura de ${material?.titulo ?? 'material'}`} />
            </div>
          )}

          {pdf && base && (
            <div
              ref={area}
              className="leitor-bib__paginas"
              onScroll={aoRolar}
              onContextMenu={baixavel ? undefined : (e) => e.preventDefault()} //Material interno: sem "salvar imagem como"
              tabIndex={0}
              aria-label="Páginas do livro"
            >
              {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                <PaginaPdf key={n} pdf={pdf} numero={n} escala={escala} base={base} registrar={registrarPagina} />
              ))}
            </div>
          )}
          {/* Mede a largura mesmo antes do PDF abrir */}
          {!pdf && !falhaPdf && <div ref={area} className="leitor-bib__medida" />}
        </main>
      </div>

      {pdf && (
        <footer className="leitor-bib__rodape">
          <button type="button" className="leitor-bib__icone" onClick={() => irPara(pagina - 1)} disabled={pagina <= 1} aria-label="Página anterior" title="Página anterior (←)">
            ‹
          </button>
          <input type="range" className="leitor-bib__trilha" min={1} max={total} value={pagina}
            onChange={(e) => irPara(Number(e.target.value))} aria-label="Ir para a página" />
          <button type="button" className="leitor-bib__icone" onClick={() => irPara(pagina + 1)} disabled={pagina >= total} aria-label="Próxima página" title="Próxima página (→)">
            ›
          </button>
          <form className="leitor-bib__ir" onSubmit={(e) => { e.preventDefault(); irPara(Number(campoPagina)); }}>
            <label>
              Página
              <input className="input" inputMode="numeric" value={campoPagina} onChange={(e) => setCampoPagina(e.target.value.replace(/\D/g, ''))}
                onBlur={() => setCampoPagina(String(pagina))} aria-label="Número da página" />
            </label>
            <span>de {total}</span>
          </form>
          <span className="leitor-bib__percentual">{percentual}%</span>
        </footer>
      )}
    </div>
  );
}

function Sumario({ itens, paginaAtual, irPara }: { itens: ItemSumario[]; paginaAtual: number; irPara: (n: number) => void }) {
  return (
    <ul className="leitor-bib__lista">
      {itens.map((item, i) => (
        <li key={`${item.titulo}-${i}`}>
          <button type="button" className={`leitor-bib__item ${item.pagina === paginaAtual ? 'leitor-bib__item--atual' : ''}`}
            onClick={() => item.pagina && irPara(item.pagina)} disabled={!item.pagina}>
            <span>{item.titulo}</span>
            {item.pagina && <small>{item.pagina}</small>}
          </button>
          {item.filhos.length > 0 && (
            <div className="leitor-bib__subnivel">
              <Sumario itens={item.filhos} paginaAtual={paginaAtual} irPara={irPara} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
