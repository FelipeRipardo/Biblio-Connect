import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buscarAluno } from '../../api/alunos';
import { ApiError } from '../../api/http';
import { listarLeituras } from '../../api/leituras';
import { encerrarSessao, obterSessao } from '../../api/sessao';
import { Avatar } from '../../components/Avatar';
import type { Aluno, Leitura } from '../../types/api';
import { rotaLeitura, visualDisciplina } from '../../utils/acervo';
import { serieTurmaCurta } from '../../utils/escola';
import { percentualLeitura } from '../../utils/leitura';

//Itens do menu do wireframe; "Downloads" ainda não tem tela (o download é feito nos detalhes do material público)
const MENU: { icone: string; rotulo: string; ativo?: boolean; rota?: string }[] = [
  { icone: '📊', rotulo: 'Visão Geral', ativo: true },
  { icone: '🔍', rotulo: 'Acervo Digital', rota: '/acervo' },
  { icone: '📚', rotulo: 'Minhas Leituras', rota: '/historico' },
  { icone: '📥', rotulo: 'Downloads' },
  { icone: '⭐', rotulo: 'Favoritos', rota: '/favoritos' },
  { icone: '📜', rotulo: 'Histórico', rota: '/historico' },
  { icone: '🔒', rotulo: 'Alterar Senha', rota: '/alterar-senha' },
];

const dataBr = (iso: string) => iso.split('-').reverse().join('/');

//Wireframe 09 - Minha Área (Aluno)
export function AreaAluno() {
  const navigate = useNavigate();
  const sessao = obterSessao()!;
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [leituras, setLeituras] = useState<Leitura[] | null>(null);

  useEffect(() => {
    listarLeituras()
      .then((lista) => setLeituras([...lista].sort((a, b) => b.ultimoAcessoEm.localeCompare(a.ultimoAcessoEm))))
      .catch(() => setLeituras([]));
  }, []);

  useEffect(() => {
    buscarAluno(sessao.id)
      .then(setAluno)
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Não foi possível carregar seus dados.'));
  }, [sessao.id]);

  function sair() {
    encerrarSessao();
    navigate('/login', { replace: true });
  }

  const dados = aluno && [
    ['Matrícula', aluno.matricula],
    ['Série/Ano', aluno.serie],
    ['Turma', aluno.turma],
    ['Turno', aluno.turno],
    ['Data de Nascimento', dataBr(aluno.dataNascimento)],
    ['Telefone do Responsável', aluno.telefoneResponsavel],
  ];

  return (
    <div className="area">
      <header className="area__topo">
        <strong className="area__marca">📚 BiblioConnect</strong>
        <div className="area__usuario">
          <Avatar nome={sessao.nome} id={sessao.id} tamanho={36} />
          <button type="button" className="botao botao--secundario botao--pequeno" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      <div className="area__titulo">
        <h1>Minha Área</h1>
      </div>

      <div className="area__corpo">
        <nav className="area__menu cartao">
          {MENU.map(({ icone, rotulo, ativo, rota }) => rota ? (
            <Link key={rotulo} to={rota} className="area__item">
              <span aria-hidden="true">{icone}</span> {rotulo}
            </Link>
          ) : (
            <span
              key={rotulo}
              className={`area__item ${ativo ? 'area__item--ativo' : 'area__item--inativo'}`}
              title={ativo ? undefined : 'Disponível em breve'}
            >
              <span aria-hidden="true">{icone}</span> {rotulo}
              {!ativo && <small>em breve</small>}
            </span>
          ))}
        </nav>

        <main className="area__conteudo">
          <section className="cartao perfil-cabecalho perfil-cabecalho--grande">
            <Avatar nome={sessao.nome} id={sessao.id} tamanho={80} />
            <div>
              <h2>{aluno?.nome ?? sessao.nome}</h2>
              <span>{aluno?.email ?? sessao.email}</span>
              <div className="etiquetas">
                <span className="etiqueta etiqueta--azul">Aluno</span>
                {aluno && <span className="etiqueta etiqueta--verde">{serieTurmaCurta(aluno.serie, aluno.turma)}</span>}
              </div>
            </div>
          </section>

          {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

          <section className="grade-2">
            <article className="cartao">
              <h2 className="cartao__titulo">👤 Meus Dados</h2>
              {dados ? (
                <dl className="resumo resumo--compacto">
                  {dados.map(([rotulo, valor]) => (
                    <div key={rotulo}>
                      <dt>{rotulo}</dt>
                      <dd>{valor}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                !erro && <p className="vazio">Carregando...</p>
              )}
              <small className="dica">Para alterar seus dados, entre em contato com a secretaria da escola.</small>
            </article>

            <article className="cartao">
              <h2 className="cartao__titulo">📖 Continue de onde parou</h2>
              {!leituras && <p className="vazio">Carregando...</p>}
              {leituras?.filter((l) => !l.concluida).length === 0 && (
                <p className="vazio">Nenhuma leitura em andamento. Abra um material do acervo para começar.</p>
              )}
              {leituras && leituras.filter((l) => !l.concluida).length > 0 && (
                <ul className="atividades">
                  {leituras.filter((l) => !l.concluida).slice(0, 3).map((l) => {
                    const percentual = percentualLeitura(l);
                    return (
                      <li key={l.id}>
                        <span className="recente__capa" style={{ background: visualDisciplina(l.material.disciplina ?? '').cor }} aria-hidden="true" />
                        <Link to={rotaLeitura(l.material.id)}>
                          <strong>{l.material.titulo}</strong>
                          <span>Página {l.paginaAtual}{percentual !== null && ` · ${percentual}% lido`}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="faixa__acoes">
                <Link to="/acervo" className="botao botao--verde">📖 Explorar o acervo</Link>
                <Link to="/historico" className="botao botao--secundario">📜 Ver histórico</Link>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
