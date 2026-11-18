import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { iniciarOuContinuarLeitura, salvarProgresso } from '../../api/leituras';
import { buscarMaterial } from '../../api/materiais';
import { BotaoFavorito } from '../../components/BotaoFavorito';
import { SeloVisibilidade } from '../../components/SeloVisibilidade';
import { TopoUsuario } from '../../components/TopoUsuario';
import { useFavoritos } from '../../hooks/useFavoritos';
import type { Leitura, LeituraProgressoRequest, Material } from '../../types/api';
import { podeBaixar, urlSegura } from '../../utils/acervo';
import { percentualLeitura } from '../../utils/leitura';

const ESPERA_SALVAR = 800; //ms sem mexer na página antes de gravar o progresso

const horaBr = (data: Date) => data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

//Leitor da biblioteca: abre o arquivo dentro do sistema e guarda no histórico a página onde o usuário parou.
//Ao abrir, POST /api/leituras cria a leitura (nova) ou devolve a existente (continuar de onde parou).
export function LeitorMaterial() {
  const { id } = useParams();
  const [material, setMaterial] = useState<Material | null>(null);
  const [leitura, setLeitura] = useState<Leitura | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState<number | null>(null);
  const [concluida, setConcluida] = useState(false);
  const [estadoSalvo, setEstadoSalvo] = useState<string | null>(null);
  const [retomada, setRetomada] = useState(false);
  const favoritos = useFavoritos();

  //Último progresso ainda não gravado: enviado ao sair da tela
  const pendente = useRef<LeituraProgressoRequest | null>(null);
  const leituraId = useRef<number | null>(null);

  useEffect(() => {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
      setErro('Material não encontrado.');
      return;
    }
    let ativo = true;
    Promise.all([buscarMaterial(numero), iniciarOuContinuarLeitura(numero)])
      .then(([m, l]) => {
        if (!ativo) return;
        setMaterial(m);
        setLeitura(l);
        leituraId.current = l.id;
        setPagina(l.paginaAtual);
        setTotalPaginas(l.totalPaginas);
        setConcluida(l.concluida);
        setRetomada(l.paginaAtual > 1 && !l.concluida);
      })
      .catch((err) => ativo && setErro(err instanceof ApiError ? err.message : 'Não foi possível abrir o material.'));
    return () => {
      ativo = false;
    };
  }, [id]);

  //Grava o progresso alguns instantes depois da última mudança de página
  useEffect(() => {
    if (!leitura) return;
    const dados = { paginaAtual: pagina, totalPaginas, concluida };
    if (
      dados.paginaAtual === leitura.paginaAtual &&
      dados.totalPaginas === leitura.totalPaginas &&
      dados.concluida === leitura.concluida
    ) {
      pendente.current = null;
      return;
    }
    pendente.current = dados;
    setEstadoSalvo('Salvando...');
    const espera = window.setTimeout(() => {
      salvarProgresso(leitura.id, dados)
        .then((salva) => {
          pendente.current = null;
          setLeitura(salva);
          setEstadoSalvo(`Progresso salvo às ${horaBr(new Date())}`);
        })
        .catch((err) => setEstadoSalvo(err instanceof ApiError ? err.message : 'Não foi possível salvar o progresso.'));
    }, ESPERA_SALVAR);
    return () => window.clearTimeout(espera);
  }, [leitura, pagina, totalPaginas, concluida]);

  //Saiu do leitor antes do salvamento automático: envia o que faltou
  useEffect(
    () => () => {
      if (pendente.current && leituraId.current) salvarProgresso(leituraId.current, pendente.current).catch(() => undefined);
    },
    [],
  );

  function irPara(numero: number) {
    if (!Number.isFinite(numero)) return;
    const limite = totalPaginas ?? Number.MAX_SAFE_INTEGER;
    setPagina(Math.min(Math.max(1, Math.trunc(numero)), limite));
    setRetomada(false);
  }

  function alterarTotal(valor: string) {
    const numero = Number(valor);
    if (!valor.trim()) return setTotalPaginas(null);
    if (!Number.isInteger(numero) || numero < 1) return;
    setTotalPaginas(numero);
    if (pagina > numero) setPagina(numero);
  }

  function alternarConcluida() {
    const nova = !concluida;
    if (nova && totalPaginas) setPagina(totalPaginas);
    setConcluida(nova);
    setRetomada(false);
  }

  const arquivo = urlSegura(material?.urlArquivo);
  const baixavel = !!material && podeBaixar(material);
  //Materiais internos abrem sem a barra do visualizador de PDF (onde fica o botão de download)
  const fonte = arquivo && `${arquivo}#page=${pagina}${baixavel ? '' : '&toolbar=0&navpanes=0'}`;
  const percentual = percentualLeitura({ paginaAtual: pagina, totalPaginas, concluida });

  return (
    <div className="inicio">
      <TopoUsuario />

      <main className="acervo leitor">
        <nav className="trilha" aria-label="Você está em">
          <Link to="/">Início</Link> › <Link to="/acervo">Acervo</Link> ›{' '}
          {material ? <Link to={`/acervo/${material.id}`}>{material.titulo}</Link> : '…'} › <span aria-current="page">Leitura</span>
        </nav>

        {erro && (
          <div className="alerta alerta--erro" role="alert">
            {erro} <Link to="/acervo">Ir para o acervo</Link>
          </div>
        )}
        {!erro && !material && <p className="vazio">Abrindo material...</p>}

        {material && leitura && (
          <>
            <header className="cartao leitor__cabecalho">
              <div>
                <h1>{material.titulo}</h1>
                <span>{material.autor}</span>
                <div className="etiquetas">
                  <SeloVisibilidade visibilidade={material.visibilidade} />
                  {concluida && <span className="etiqueta etiqueta--verde">✓ Concluída</span>}
                </div>
              </div>
              <div className="leitor__acoes">
                <BotaoFavorito favorito={favoritos.ehFavorito(material.id)} titulo={material.titulo}
                  onClick={() => favoritos.alternar(material.id)} desabilitado={favoritos.pendente(material.id)} />
                {baixavel && arquivo && (
                  <a className="botao detalhes__baixar" href={arquivo} target="_blank" rel="noopener noreferrer" download>📥 Baixar</a>
                )}
                <Link className="botao botao--secundario" to="/historico">📜 Histórico</Link>
              </div>
            </header>

            {retomada && (
              <div className="alerta alerta--info" role="status">
                Continuando de onde você parou: página {pagina}.{' '}
                <button type="button" className="leitor__link" onClick={() => irPara(1)}>Começar do início</button>
              </div>
            )}
            {!baixavel && (
              <div className="alerta alerta--info">
                🔒 Material interno: a leitura é feita somente aqui na biblioteca, sem opção de download.
              </div>
            )}
            {favoritos.erro && <div className="alerta alerta--erro" role="alert">{favoritos.erro}</div>}

            <section className="cartao leitor__barra" aria-label="Controle de leitura">
              <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => irPara(pagina - 1)} disabled={pagina <= 1}>
                ◀ Anterior
              </button>
              <label className="leitor__pagina">
                Página
                <input className="input" type="number" min={1} max={totalPaginas ?? undefined} value={pagina}
                  onChange={(e) => irPara(Number(e.target.value))} aria-label="Página atual" />
              </label>
              <label className="leitor__pagina">
                de
                <input className="input" type="number" min={1} placeholder="?" value={totalPaginas ?? ''}
                  onChange={(e) => alterarTotal(e.target.value)} aria-label="Total de páginas"
                  title="Informe o total de páginas para acompanhar o percentual lido" />
              </label>
              <button type="button" className="botao botao--secundario botao--pequeno" onClick={() => irPara(pagina + 1)}
                disabled={totalPaginas !== null && pagina >= totalPaginas}>
                Próxima ▶
              </button>

              <div className="leitor__progresso">
                <div className="progresso" role="progressbar" aria-valuemin={0} aria-valuemax={100}
                  aria-valuenow={percentual ?? undefined} aria-label="Progresso da leitura">
                  <span style={{ width: `${percentual ?? 0}%` }} />
                </div>
                <small>{percentual === null ? 'Informe o total de páginas para ver o percentual' : `${percentual}% lido`}</small>
              </div>

              <button type="button" className={`botao botao--pequeno ${concluida ? 'botao--secundario' : 'botao--verde'}`} onClick={alternarConcluida}>
                {concluida ? '↺ Marcar como não concluída' : '✓ Concluir leitura'}
              </button>
              <small className="dica leitor__salvo" role="status">{estadoSalvo ?? 'Seu progresso é salvo automaticamente.'}</small>
            </section>

            {fonte ? (
              //key: troca de página recarrega o visualizador já na página escolhida
              <>
                <iframe key={fonte} className="leitor__arquivo" src={fonte} title={`Leitura de ${material.titulo}`} />
                {/* Alguns sites não permitem exibir o arquivo dentro de outra página; o público pode abrir em nova aba */}
                {baixavel && arquivo && (
                  <small className="dica">
                    O arquivo não apareceu? <a href={fonte} target="_blank" rel="noopener noreferrer">Abrir em uma nova aba</a>.
                  </small>
                )}
              </>
            ) : (
              <p className="vazio">Este material ainda não tem arquivo digital disponível.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
