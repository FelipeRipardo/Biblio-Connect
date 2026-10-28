import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { excluirAluno, listarAlunos } from '../../api/alunos';
import { ApiError } from '../../api/http';
import { Avatar } from '../../components/Avatar';
import { CartaoNumero } from '../../components/PainelLayout';
import { Paginacao } from '../../components/Paginacao';
import type { Aluno } from '../../types/api';
import { SERIES, TURMAS, TURNOS, distintos, serieTurmaCurta } from '../../utils/escola';
import { AdminLayout, idDoAdmin } from './AdminLayout';

const POR_PAGINA = 8;
const FILTROS_VAZIOS = { busca: '', serie: '', turma: '', turno: '' };

const mensagemDeErro = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.';

//Wireframe 21 - Gerenciar Alunos
export function ListaAlunos() {
  const mensagemRecebida = (useLocation().state as { mensagem?: string } | null)?.mensagem ?? null;

  const [alunos, setAlunos] = useState<Aluno[] | null>(null);
  const [rascunho, setRascunho] = useState(FILTROS_VAZIOS);
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [pagina, setPagina] = useState(1);
  const [sucesso, setSucesso] = useState<string | null>(mensagemRecebida);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarAlunos().then(setAlunos).catch((err) => setErro(mensagemDeErro(err)));
  }, []);

  function filtrar(e: FormEvent) {
    e.preventDefault();
    setFiltros(rascunho);
    setPagina(1);
  }

  async function remover(aluno: Aluno) {
    if (!window.confirm(`Excluir o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`)) return;
    setSucesso(null);
    setErro(null);
    try {
      setSucesso((await excluirAluno(idDoAdmin(), aluno.id)).mensagem);
      setAlunos((atual) => atual?.filter((a) => a.id !== aluno.id) ?? null);
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  const lista = alunos ?? [];
  const termo = filtros.busca.trim().toLowerCase();
  const filtrados = lista.filter(
    (a) =>
      (!termo || [a.nome, a.email, a.matricula].some((v) => v.toLowerCase().includes(termo))) &&
      (!filtros.serie || a.serie === filtros.serie) &&
      (!filtros.turma || a.turma === filtros.turma) &&
      (!filtros.turno || a.turno === filtros.turno),
  );
  const visiveis = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const opcoesSerie = distintos([...SERIES, ...lista.map((a) => a.serie)]).sort((a, b) => SERIES.indexOf(a) - SERIES.indexOf(b));
  const opcoesTurma = distintos([...TURMAS, ...lista.map((a) => a.turma)]);
  const opcoesTurno = distintos([...TURNOS, ...lista.map((a) => a.turno)]);

  return (
    <AdminLayout
      titulo="Gerenciar Alunos"
      acoes={<Link className="botao botao--verde botao--pequeno" to="/admin/alunos/novo">+ Novo Aluno</Link>}
    >
      <section className="indicadores">
        <CartaoNumero rotulo="Total de Alunos" valor={alunos ? lista.length : '…'} cor="var(--azul-escuro)" />
        <CartaoNumero rotulo="Séries" valor={alunos ? distintos(lista.map((a) => a.serie)).length : '…'} cor="var(--verde)" />
        <CartaoNumero rotulo="Turmas" valor={alunos ? distintos(lista.map((a) => serieTurmaCurta(a.serie, a.turma))).length : '…'} cor="var(--roxo)" />
        <CartaoNumero rotulo="Turnos" valor={alunos ? distintos(lista.map((a) => a.turno)).length : '…'} cor="var(--laranja)" />
      </section>

      <form className="filtros" onSubmit={filtrar}>
        <input
          className="input filtros__busca"
          placeholder="🔍 Buscar aluno..."
          aria-label="Buscar aluno por nome, e-mail ou matrícula"
          value={rascunho.busca}
          onChange={(e) => setRascunho({ ...rascunho, busca: e.target.value })}
        />
        <label>
          Série:
          <select className="input" value={rascunho.serie} onChange={(e) => setRascunho({ ...rascunho, serie: e.target.value })}>
            <option value="">Todas</option>
            {opcoesSerie.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Turma:
          <select className="input" value={rascunho.turma} onChange={(e) => setRascunho({ ...rascunho, turma: e.target.value })}>
            <option value="">Todas</option>
            {opcoesTurma.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>
          Turno:
          <select className="input" value={rascunho.turno} onChange={(e) => setRascunho({ ...rascunho, turno: e.target.value })}>
            <option value="">Todos</option>
            {opcoesTurno.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <button type="submit" className="botao botao--laranja botao--pequeno">Filtrar</button>
      </form>

      {sucesso && <div className="alerta alerta--sucesso" role="status">{sucesso}</div>}
      {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

      <div className="tabela__rolagem">
        <table className="tabela tabela--escura">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Matrícula</th>
              <th>Série/Turma</th>
              <th>Turno</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="pessoa">
                    <Avatar nome={a.nome} id={a.id} tamanho={32} />
                    <div>
                      <strong>{a.nome}</strong>
                      <span>{a.email}</span>
                    </div>
                  </div>
                </td>
                <td className="tabela__suave">{a.matricula}</td>
                <td>{serieTurmaCurta(a.serie, a.turma)}</td>
                <td>{a.turno}</td>
                <td>
                  <div className="acoes">
                    <Link to={`/admin/alunos/${a.id}`} title="Editar" aria-label={`Editar ${a.nome}`}>✏️</Link>
                    <button type="button" title="Excluir" aria-label={`Excluir ${a.nome}`} onClick={() => remover(a)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {alunos && visiveis.length === 0 && <p className="vazio">Nenhum aluno encontrado.</p>}
        {!alunos && !erro && <p className="vazio">Carregando...</p>}
      </div>

      <Paginacao pagina={pagina} total={filtrados.length} porPagina={POR_PAGINA} rotulo="alunos" onChange={setPagina} />
    </AdminLayout>
  );
}
