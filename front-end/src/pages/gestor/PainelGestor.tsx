import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { listarMateriais } from '../../api/materiais';
import { CartaoNumero } from '../../components/PainelLayout';
import type { Material } from '../../types/api';
import { rotuloTipo, urlSegura, visualDisciplina } from '../../utils/acervo';
import { distintos } from '../../utils/escola';
import { GestorLayout } from './GestorLayout';

//Painel do Gestor, no mesmo padrão do Dashboard do Administrador (wireframe 12), com os dados do acervo
export function PainelGestor() {
  const [materiais, setMateriais] = useState<Material[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarMateriais()
      .then(setMateriais)
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar o acervo.'));
  }, []);

  const lista = materiais ?? [];
  const carregando = !materiais;
  const valor = (n: number) => (carregando ? '…' : n);

  //Materiais por disciplina, da maior para a menor
  const porDisciplina = distintos(lista.map((m) => m.disciplina ?? ''))
    .map((disciplina) => ({ disciplina, total: lista.filter((m) => m.disciplina === disciplina).length }))
    .sort((a, b) => b.total - a.total);
  const maior = Math.max(1, ...porDisciplina.map((d) => d.total));

  const recentes = [...lista].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 5);

  return (
    <GestorLayout titulo="Painel do Gestor">
      {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

      <section className="indicadores">
        <CartaoNumero icone="📚" rotulo="Materiais no Acervo" valor={valor(lista.length)} cor="var(--azul-escuro)" />
        <CartaoNumero icone="💻" rotulo="Com Arquivo Digital" valor={valor(lista.filter((m) => urlSegura(m.urlArquivo)).length)} cor="var(--verde)" />
        <CartaoNumero icone="🏷️" rotulo="Disciplinas Cobertas" valor={valor(porDisciplina.length)} cor="var(--laranja)" />
        <CartaoNumero icone="🎓" rotulo="Séries Atendidas" valor={valor(distintos(lista.map((m) => m.serie ?? '')).length)} cor="var(--roxo)" />
      </section>

      <section className="grade-2">
        <article className="cartao">
          <h2 className="cartao__titulo">📊 Materiais por Disciplina</h2>
          {porDisciplina.length === 0 ? (
            <p className="vazio">{carregando ? 'Carregando...' : 'Nenhum material cadastrado.'}</p>
          ) : (
            <ul className="barras">
              {porDisciplina.map(({ disciplina, total }) => (
                <li key={disciplina}>
                  <span className="barras__rotulo">{disciplina}</span>
                  <span className="barras__trilho">
                    <span style={{ width: `${(total / maior) * 100}%`, background: visualDisciplina(disciplina).cor }} />
                  </span>
                  <span className="barras__valor">{total}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="cartao">
          <h2 className="cartao__titulo">⚡ Últimos Cadastrados</h2>
          {recentes.length === 0 ? (
            <p className="vazio">{carregando ? 'Carregando...' : 'Nenhum material cadastrado.'}</p>
          ) : (
            <ul className="atividades">
              {recentes.map((m) => (
                <li key={m.id}>
                  <span className="recente__capa" style={{ background: visualDisciplina(m.disciplina ?? '').cor }} aria-hidden="true" />
                  <Link to={`/gestor/livros/${m.id}/editar`}>
                    <strong>{m.titulo}</strong>
                    <span>{rotuloTipo(m.tipoMaterial)} · {m.autor}</span>
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
          <span>O Gestor pode cadastrar, editar e excluir materiais do acervo digital.</span>
        </div>
        <div className="faixa__acoes">
          <Link className="botao botao--verde" to="/gestor/livros/novo">+ Novo Livro</Link>
          <Link className="botao botao--roxo" to="/gestor/livros">📚 Gerenciar Livros</Link>
        </div>
      </section>
    </GestorLayout>
  );
}
