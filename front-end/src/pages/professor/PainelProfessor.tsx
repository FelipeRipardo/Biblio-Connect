import { useEffect, useState } from 'react';
import { ApiError } from '../../api/http';
import { buscarProfessor } from '../../api/professores';
import { obterSessao } from '../../api/sessao';
import { CartaoNumero, PainelLayout, type ItemMenu } from '../../components/PainelLayout';
import type { Professor } from '../../types/api';

const MENU_PROFESSOR: ItemMenu[] = [
  { icone: '📊', rotulo: 'Visão Geral', rota: '/professor', exato: true },
  { icone: '📚', rotulo: 'Leituras da Turma' },
  { icone: '📖', rotulo: 'Atribuir Leituras' },
  { icone: '👥', rotulo: 'Meus Alunos' },
  { icone: '📝', rotulo: 'Relatórios' },
  { icone: '🔑', rotulo: 'Alterar Senha' },
];

//Wireframe 10 - Painel do Professor, com os dados que o back-end já fornece
export function PainelProfessor() {
  const sessao = obterSessao()!;
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarProfessor(sessao.id)
      .then(setProfessor)
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar seus dados.'));
  }, [sessao.id]);

  return (
    <PainelLayout
      area="Área do Professor"
      descricaoUsuario={professor?.disciplinas[0] ?? 'Professor'}
      menu={MENU_PROFESSOR}
      titulo="Painel do Professor"
    >
      {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

      <section className="indicadores">
        <CartaoNumero icone="📚" rotulo="Disciplinas" valor={professor ? professor.disciplinas.length : '…'} cor="var(--verde)" />
        <CartaoNumero icone="🎓" rotulo="Turmas Atribuídas" valor={professor ? professor.turmas.length : '…'} cor="var(--roxo)" />
      </section>

      <section className="grade-2">
        <article className="cartao">
          <h2 className="cartao__titulo">📚 Disciplinas que Leciona</h2>
          <div className="chips">
            {professor?.disciplinas.map((d) => (
              <span key={d} className="chip" style={{ background: 'var(--verde)' }}>{d}</span>
            ))}
          </div>
          <h2 className="cartao__titulo">🎓 Turmas Atribuídas</h2>
          <div className="chips">
            {professor?.turmas.map((t) => (
              <span key={t} className="chip" style={{ background: 'var(--roxo)' }}>{t}</span>
            ))}
          </div>
          <small className="dica">🔒 Disciplinas e turmas são gerenciadas pela coordenação.</small>
        </article>

        <article className="cartao">
          <h2 className="cartao__titulo">👤 Meus Dados</h2>
          {professor ? (
            <dl className="resumo resumo--compacto">
              {[
                ['Nome', professor.nome],
                ['Email Institucional', professor.email],
                ['Telefone', professor.telefone],
                ['Registro Funcional', professor.registroFuncional],
              ].map(([rotulo, valor]) => (
                <div key={rotulo}>
                  <dt>{rotulo}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
            </dl>
          ) : (
            !erro && <p className="vazio">Carregando...</p>
          )}
        </article>
      </section>

      <section className="faixa">
        <div>
          <strong>Em breve</strong>
          <span>Acompanhamento das leituras da turma, atribuição de leituras e relatórios por disciplina.</span>
        </div>
      </section>
    </PainelLayout>
  );
}
