import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { listarLeituras } from '../../api/leituras';
import { SeloVisibilidade } from '../../components/SeloVisibilidade';
import { TopoUsuario } from '../../components/TopoUsuario';
import type { Leitura } from '../../types/api';
import { rotaLeitura, serieCurta, visualDisciplina } from '../../utils/acervo';
import { dataHoraBr, percentualLeitura } from '../../utils/leitura';

type Filtro = 'TODAS' | 'ANDAMENTO' | 'CONCLUIDAS';

const FILTROS: { valor: Filtro; rotulo: string; aceita: (l: Leitura) => boolean }[] = [
  { valor: 'TODAS', rotulo: 'Todas', aceita: () => true },
  { valor: 'ANDAMENTO', rotulo: 'Em andamento', aceita: (l) => !l.concluida },
  { valor: 'CONCLUIDAS', rotulo: 'Concluídas', aceita: (l) => l.concluida },
];

//Histórico de leituras do usuário logado: cada material aberto no leitor gera uma leitura,
//que guarda a página onde ele parou para continuar depois (GET /api/leituras)
export function HistoricoLeituras() {
  const [leituras, setLeituras] = useState<Leitura[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('TODAS');

  useEffect(() => {
    listarLeituras()
      .then((lista) => setLeituras([...lista].sort((a, b) => b.ultimoAcessoEm.localeCompare(a.ultimoAcessoEm))))
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar seu histórico.'));
  }, []);

  const lista = leituras ?? [];
  const visiveis = lista.filter(FILTROS.find((f) => f.valor === filtro)!.aceita);
  const contagem = (f: (typeof FILTROS)[number]) => (leituras ? ` (${lista.filter(f.aceita).length})` : '');

  return (
    <div className="inicio">
      <TopoUsuario />

      <main className="acervo">
        <div className="acervo__titulo">
          <div>
            <h1>Histórico de Leituras</h1>
            <p>Continue de onde parou ou reveja o que você já leu na biblioteca</p>
          </div>
          <Link to="/acervo" className="botao botao--verde">📖 Explorar o acervo</Link>
        </div>

        <nav className="acervo__pilulas" aria-label="Situação da leitura">
          {FILTROS.map((f) => (
            <button key={f.valor} type="button" className={`pilula ${filtro === f.valor ? 'pilula--ativa' : ''}`}
              aria-pressed={filtro === f.valor} onClick={() => setFiltro(f.valor)}>
              {f.rotulo}{contagem(f)}
            </button>
          ))}
        </nav>

        {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}
        {!erro && !leituras && <p className="vazio">Carregando histórico...</p>}

        {leituras && visiveis.length === 0 && (
          <div className="cartao historico__vazio">
            <p className="vazio">
              {lista.length === 0
                ? 'Você ainda não leu nenhum material. Ao abrir um material no leitor, ele aparece aqui.'
                : 'Nenhuma leitura nesta situação.'}
            </p>
          </div>
        )}

        {visiveis.length > 0 && (
          <ul className="historico">
            {visiveis.map((l) => <ItemHistorico key={l.id} leitura={l} />)}
          </ul>
        )}
      </main>
    </div>
  );
}

function ItemHistorico({ leitura }: { leitura: Leitura }) {
  const { material } = leitura;
  const { cor, icone } = visualDisciplina(material.disciplina ?? '');
  const percentual = percentualLeitura(leitura);

  return (
    <li className="cartao historico__item">
      <Link to={`/acervo/${material.id}`} className="historico__capa" style={{ background: cor }} aria-label={`Ver detalhes de ${material.titulo}`}>
        <span aria-hidden="true">{icone}</span>
        {material.serie && <small>{serieCurta(material.serie)}</small>}
      </Link>

      <div className="historico__info">
        <h2><Link to={`/acervo/${material.id}`}>{material.titulo}</Link></h2>
        <span className="historico__autor">{material.autor}</span>
        <div className="etiquetas">
          {material.disciplina && <span className="etiqueta etiqueta--azul">{material.disciplina}</span>}
          <SeloVisibilidade visibilidade={material.visibilidade} />
          <span className={`etiqueta ${leitura.concluida ? 'etiqueta--verde' : 'etiqueta--roxo'}`}>
            {leitura.concluida ? '✓ Concluída' : '⏳ Em andamento'}
          </span>
        </div>

        <div className="historico__progresso">
          <div className="progresso" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentual ?? undefined}
            aria-label={`Progresso de ${material.titulo}`}>
            <span style={{ width: `${percentual ?? 0}%` }} />
          </div>
          <small>
            Página {leitura.paginaAtual}{leitura.totalPaginas ? ` de ${leitura.totalPaginas}` : ''}
            {percentual !== null && ` · ${percentual}%`}
          </small>
        </div>

        <small className="dica">
          Iniciada em {dataHoraBr(leitura.iniciadaEm)} · Último acesso em {dataHoraBr(leitura.ultimoAcessoEm)}
        </small>
      </div>

      <Link className={`botao botao--pequeno historico__acao ${leitura.concluida ? 'botao--secundario' : 'botao--verde'}`} to={rotaLeitura(material.id)}>
        {leitura.concluida ? '📖 Ler novamente' : '▶ Continuar leitura'}
      </Link>
    </li>
  );
}
