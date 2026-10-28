import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { excluirProfessor, listarProfessores } from '../../api/professores';
import { Avatar } from '../../components/Avatar';
import { CartaoNumero } from '../../components/PainelLayout';
import { Paginacao } from '../../components/Paginacao';
import type { Professor } from '../../types/api';
import { distintos } from '../../utils/escola';
import { AdminLayout, idDoAdmin } from './AdminLayout';

const POR_PAGINA = 7;

const mensagemDeErro = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.';

//Wireframe 22 - Gestão de Professores
export function ListaProfessores() {
  const mensagemRecebida = (useLocation().state as { mensagem?: string } | null)?.mensagem ?? null;

  const [professores, setProfessores] = useState<Professor[] | null>(null);
  const [busca, setBusca] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [pagina, setPagina] = useState(1);
  const [sucesso, setSucesso] = useState<string | null>(mensagemRecebida);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarProfessores().then(setProfessores).catch((err) => setErro(mensagemDeErro(err)));
  }, []);

  async function remover(professor: Professor) {
    if (!window.confirm(`Excluir o professor "${professor.nome}"? Esta ação não pode ser desfeita.`)) return;
    setSucesso(null);
    setErro(null);
    try {
      setSucesso((await excluirProfessor(idDoAdmin(), professor.id)).mensagem);
      setProfessores((atual) => atual?.filter((p) => p.id !== professor.id) ?? null);
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  }

  const lista = professores ?? [];
  const disciplinas = distintos(lista.flatMap((p) => p.disciplinas));
  const termo = busca.trim().toLowerCase();
  const filtrados = lista.filter(
    (p) =>
      (!termo || [p.nome, p.email, ...p.disciplinas].some((v) => v.toLowerCase().includes(termo))) &&
      (!disciplina || p.disciplinas.includes(disciplina)),
  );
  const visiveis = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function aoFiltrar(acao: () => void) {
    acao();
    setPagina(1);
  }

  return (
    <AdminLayout titulo="Gestão de Professores">
      <section className="indicadores">
        <CartaoNumero icone="👨‍🏫" rotulo="Total de Professores" valor={professores ? lista.length : '…'} cor="var(--roxo)" />
        <CartaoNumero icone="📚" rotulo="Disciplinas" valor={professores ? disciplinas.length : '…'} cor="var(--azul-link)" />
        <CartaoNumero icone="🎓" rotulo="Turmas Atendidas" valor={professores ? distintos(lista.flatMap((p) => p.turmas)).length : '…'} cor="var(--verde)" />
      </section>

      <div className="filtros filtros--soltos">
        <input
          className="input filtros__busca filtros__busca--larga"
          placeholder="🔍 Buscar professor por nome ou disciplina..."
          aria-label="Buscar professor por nome ou disciplina"
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
        <Link className="botao botao--roxo botao--pequeno filtros__acao" to="/admin/professores/novo">+ Novo Professor</Link>
      </div>

      {sucesso && <div className="alerta alerta--sucesso" role="status">{sucesso}</div>}
      {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

      <section className="cartao cartao--tabela">
        <div className="tabela__rolagem">
          <table className="tabela tabela--clara">
            <thead>
              <tr>
                <th>Professor</th>
                <th>Disciplina</th>
                <th>Email</th>
                <th>Turmas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="pessoa">
                      <Avatar nome={p.nome} id={p.id} tamanho={36} />
                      <div>
                        <strong className="pessoa__nome-normal">{p.nome}</strong>
                        <span>RF: {p.registroFuncional}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.disciplinas.join(', ')}</td>
                  <td>{p.email}</td>
                  <td title={p.turmas.join(', ')}>
                    {p.turmas.length} {p.turmas.length === 1 ? 'turma' : 'turmas'}
                  </td>
                  <td>
                    <div className="acoes">
                      <Link to={`/admin/professores/${p.id}`} title="Editar" aria-label={`Editar ${p.nome}`}>✏️</Link>
                      <button type="button" title="Excluir" aria-label={`Excluir ${p.nome}`} onClick={() => remover(p)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {professores && visiveis.length === 0 && <p className="vazio">Nenhum professor encontrado.</p>}
          {!professores && !erro && <p className="vazio">Carregando...</p>}
        </div>
        <Paginacao pagina={pagina} total={filtrados.length} porPagina={POR_PAGINA} rotulo="professores" onChange={setPagina} />
      </section>
    </AdminLayout>
  );
}
