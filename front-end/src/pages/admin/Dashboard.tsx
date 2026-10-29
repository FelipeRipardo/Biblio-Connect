import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarAlunos } from '../../api/alunos';
import { ApiError } from '../../api/http';
import { listarProfessores } from '../../api/professores';
import { Avatar } from '../../components/Avatar';
import { CartaoNumero } from '../../components/PainelLayout';
import type { Aluno, Professor } from '../../types/api';
import { SERIES, distintos, serieTurmaCurta } from '../../utils/escola';
import { AdminLayout } from './AdminLayout';

const CORES_BARRAS = ['#27ae60', '#3498db', '#f39c12', '#9b59b6', '#e74c3c', '#1abc9c', '#e07c24'];

//Wireframe 12, com os indicadores que o back-end já fornece (alunos e professores)
export function Dashboard() {
  const [alunos, setAlunos] = useState<Aluno[] | null>(null);
  const [professores, setProfessores] = useState<Professor[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listarAlunos(), listarProfessores()])
      .then(([a, p]) => {
        setAlunos(a);
        setProfessores(p);
      })
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar os dados.'));
  }, []);

  const carregando = !alunos || !professores;
  const turmas = distintos((alunos ?? []).map((a) => serieTurmaCurta(a.serie, a.turma)));
  const disciplinas = distintos((professores ?? []).flatMap((p) => p.disciplinas));

  //Alunos por série, na ordem escolar
  const porSerie = distintos((alunos ?? []).map((a) => a.serie))
    .sort((a, b) => SERIES.indexOf(a) - SERIES.indexOf(b))
    .map((serie) => ({ serie, total: (alunos ?? []).filter((a) => a.serie === serie).length }));
  const maiorSerie = Math.max(1, ...porSerie.map((s) => s.total));

  //Últimos cadastros (ids maiores são os mais recentes)
  const recentes = [
    ...(alunos ?? []).map((a) => ({ id: a.id, nome: a.nome, detalhe: `Aluno · ${serieTurmaCurta(a.serie, a.turma)}`, rota: `/admin/alunos/${a.id}` })),
    ...(professores ?? []).map((p) => ({ id: p.id, nome: p.nome, detalhe: `Professor · ${p.disciplinas.join(', ')}`, rota: `/admin/professores/${p.id}` })),
  ]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <AdminLayout titulo="Dashboard - Visão Geral">
      {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

      <section className="indicadores">
        <CartaoNumero icone="👥" rotulo="Alunos Cadastrados" valor={carregando ? '…' : alunos.length} cor="var(--verde)" />
        <CartaoNumero icone="👨‍🏫" rotulo="Professores" valor={carregando ? '…' : professores.length} cor="var(--roxo)" />
        <CartaoNumero icone="🎓" rotulo="Turmas com Alunos" valor={carregando ? '…' : turmas.length} cor="var(--azul-escuro)" />
        <CartaoNumero icone="📚" rotulo="Disciplinas Lecionadas" valor={carregando ? '…' : disciplinas.length} cor="var(--laranja)" />
      </section>

      <section className="grade-2">
        <article className="cartao">
          <h2 className="cartao__titulo">🎓 Alunos por Série</h2>
          {porSerie.length === 0 ? (
            <p className="vazio">{carregando ? 'Carregando...' : 'Nenhum aluno cadastrado.'}</p>
          ) : (
            <ul className="barras">
              {porSerie.map(({ serie, total }, i) => (
                <li key={serie}>
                  <span className="barras__rotulo">{serie}</span>
                  <span className="barras__trilho">
                    <span style={{ width: `${(total / maiorSerie) * 100}%`, background: CORES_BARRAS[i % CORES_BARRAS.length] }} />
                  </span>
                  <span className="barras__valor">{total}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="cartao">
          <h2 className="cartao__titulo">⚡ Cadastros Recentes</h2>
          {recentes.length === 0 ? (
            <p className="vazio">{carregando ? 'Carregando...' : 'Nenhum usuário cadastrado.'}</p>
          ) : (
            <ul className="atividades">
              {recentes.map((r) => (
                <li key={r.id}>
                  <Avatar nome={r.nome} id={r.id} tamanho={30} />
                  <Link to={r.rota}>
                    <strong>{r.nome}</strong>
                    <span>{r.detalhe}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="faixa">
        <div>
          <strong>Ações rápidas</strong>
          <span>O cadastro de usuários é feito exclusivamente pelo Administrador.</span>
        </div>
        <div className="faixa__acoes">
          <Link className="botao botao--verde" to="/admin/alunos/novo">+ Novo Aluno</Link>
          <Link className="botao botao--roxo" to="/admin/professores/novo">+ Novo Professor</Link>
        </div>
      </section>
    </AdminLayout>
  );
}
