import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { excluirMaterial, listarMateriais } from '../../api/materiais';
import { obterSessao } from '../../api/sessao';
import { GestaoAcervoLayout } from '../../components/GestaoAcervoLayout';
import { CartaoNumero } from '../../components/PainelLayout';
import { Paginacao } from '../../components/Paginacao';
import type { CategoriaMaterial, Material } from '../../types/api';
import { CATEGORIAS, rotaGestaoAcervo, rotuloCategoria, rotuloTipo, serieCurta, urlSegura, visualDisciplina } from '../../utils/acervo';
import { distintos } from '../../utils/escola';

const POR_PAGINA = 7;

const mensagemDeErro = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.';

//Wireframe 20 - Gerenciar Livros (Administrador e Gestor).
//O back-end ainda não controla exemplares/empréstimos, então as colunas Qtd/Disponível/Status viram Tipo/Ano/Arquivo.
export function GerenciarLivros() {
  const mensagemRecebida = (useLocation().state as { mensagem?: string } | null)?.mensagem ?? null;
  const base = rotaGestaoAcervo(obterSessao()?.perfil);

  const [materiais, setMateriais] = useState<Material[] | null>(null);
  const [busca, setBusca] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [categoria, setCategoria] = useState<CategoriaMaterial | ''>('');
  const [pagina, setPagina] = useState(1);
  const [sucesso, setSucesso] = useState<string | null>(mensagemRecebida);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarMateriais().then(setMateriais).catch((err) => setErro(mensagemDeErro(err)));
  }, []);

  async function remover(material: Material) {
    if (!window.confirm(`Excluir "${material.titulo}" do acervo? Esta ação não pode ser desfeita.`)) return;
    setSucesso(null);
    setErro(null);
    try {
      setSucesso((await excluirMaterial(material.id)).mensagem);
      setMateriais((atual) => atual?.filter((m) => m.id !== material.id) ?? null);
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  const lista = materiais ?? [];
  const disciplinas = distintos(lista.map((m) => m.disciplina ?? ''));
  const termo = busca.trim().toLowerCase();
  const filtrados = lista.filter(
    (m) =>
      (!termo || [m.titulo, m.autor, m.isbn ?? ''].some((v) => v.toLowerCase().includes(termo))) &&
      (!disciplina || m.disciplina === disciplina) &&
      (!categoria || m.categoria === categoria),
  );
  const visiveis = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function aoFiltrar(acao: () => void) {
    acao();
    setPagina(1);
  }

  const total = (valor: number) => (materiais ? valor : '…');

  return (
    <GestaoAcervoLayout
      titulo="Gerenciar Livros"
      acoes={<Link to="/acervo" className="botao botao--secundario botao--pequeno">📚 Ver acervo</Link>}
    >
      <section className="indicadores">
        <CartaoNumero icone="📚" rotulo="Total no Acervo" valor={total(lista.length)} cor="var(--azul-escuro)" />
        <CartaoNumero icone="📖" rotulo="Livros" valor={total(lista.filter((m) => m.tipoMaterial === 'LIVRO').length)} cor="var(--verde)" />
        <CartaoNumero icone="🏷️" rotulo="Disciplinas" valor={total(disciplinas.length)} cor="var(--laranja)" />
        <CartaoNumero icone="🎓" rotulo="Séries Atendidas" valor={total(distintos(lista.map((m) => m.serie ?? '')).length)} cor="var(--roxo)" />
      </section>

      <div className="filtros filtros--soltos">
        <input
          className="input filtros__busca filtros__busca--larga"
          placeholder="🔍 Buscar por título, autor, ISBN..."
          aria-label="Buscar por título, autor ou ISBN"
          value={busca}
          onChange={(e) => aoFiltrar(() => setBusca(e.target.value))}
        />
        <select
          className="input"
          aria-label="Filtrar por disciplina"
          value={disciplina}
          onChange={(e) => aoFiltrar(() => setDisciplina(e.target.value))}
        >
          <option value="">📚 Disciplina</option>
          {disciplinas.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          className="input"
          aria-label="Filtrar por tipo de livro"
          value={categoria}
          onChange={(e) => aoFiltrar(() => setCategoria(e.target.value as CategoriaMaterial | ''))}
        >
          <option value="">🏷️ Tipo</option>
          {CATEGORIAS.map(({ valor, rotulo }) => <option key={valor} value={valor}>{rotulo}</option>)}
        </select>
        <Link className="botao botao--verde botao--pequeno filtros__acao" to={`${base}/novo`}>+ Novo Livro</Link>
      </div>

      {sucesso && <div className="alerta alerta--sucesso" role="status">{sucesso}</div>}
      {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

      <section className="cartao cartao--tabela">
        <div className="tabela__rolagem">
          <table className="tabela tabela--clara">
            <thead>
              <tr>
                <th>Livro</th>
                <th>Disciplina</th>
                <th>Série</th>
                <th>Tipo</th>
                <th>Ano</th>
                <th>Arquivo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="pessoa">
                      <span className="recente__capa" style={{ background: visualDisciplina(m.disciplina ?? '').cor }} aria-hidden="true" />
                      <div>
                        <strong className="pessoa__nome-normal">{m.titulo}</strong>
                        <span>{m.autor}{m.isbn && ` | ISBN: ${m.isbn}`}</span>
                      </div>
                    </div>
                  </td>
                  <td>{m.disciplina ?? '—'}</td>
                  <td>{m.serie ? serieCurta(m.serie) : '—'}</td>
                  <td title={rotuloTipo(m.tipoMaterial)}>{rotuloCategoria(m.categoria)}</td>
                  <td>{m.ano ?? '—'}</td>
                  <td>
                    {urlSegura(m.urlArquivo) ? (
                      <span className="etiqueta etiqueta--verde">Digital</span>
                    ) : (
                      <span className="etiqueta etiqueta--amarela">Sem arquivo</span>
                    )}
                  </td>
                  <td>
                    <div className="acoes">
                      <Link to={`${base}/${m.id}/editar`} title="Editar" aria-label={`Editar ${m.titulo}`}>✏️</Link>
                      <Link to={`/acervo/${m.id}`} title="Ver detalhes" aria-label={`Ver detalhes de ${m.titulo}`}>👁</Link>
                      <button type="button" title="Excluir" aria-label={`Excluir ${m.titulo}`} onClick={() => remover(m)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {materiais && visiveis.length === 0 && <p className="vazio">Nenhum material encontrado.</p>}
          {!materiais && !erro && <p className="vazio">Carregando...</p>}
        </div>
        <Paginacao pagina={pagina} total={filtrados.length} porPagina={POR_PAGINA} rotulo="materiais" onChange={setPagina} />
      </section>
    </GestaoAcervoLayout>
  );
}
