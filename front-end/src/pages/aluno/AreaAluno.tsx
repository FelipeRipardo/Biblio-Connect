import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarAluno } from '../../api/alunos';
import { ApiError } from '../../api/http';
import { encerrarSessao, obterSessao } from '../../api/sessao';
import { Avatar } from '../../components/Avatar';
import type { Aluno } from '../../types/api';
import { serieTurmaCurta } from '../../utils/escola';

//Itens do menu do wireframe; só a Visão Geral tem suporte no back-end por enquanto
const MENU = [
  { icone: '📊', rotulo: 'Visão Geral', ativo: true },
  { icone: '📚', rotulo: 'Minhas Leituras' },
  { icone: '📥', rotulo: 'Downloads' },
  { icone: '⭐', rotulo: 'Favoritos' },
  { icone: '📜', rotulo: 'Histórico' },
  { icone: '🔒', rotulo: 'Alterar Senha' },
];

const dataBr = (iso: string) => iso.split('-').reverse().join('/');

//Wireframe 09 - Minha Área (Aluno)
export function AreaAluno() {
  const navigate = useNavigate();
  const sessao = obterSessao()!;
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [erro, setErro] = useState<string | null>(null);

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
          {MENU.map(({ icone, rotulo, ativo }) => (
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
              <h2 className="cartao__titulo">📖 Leituras e Empréstimos</h2>
              <p className="vazio">
                Em breve você poderá consultar o acervo, acompanhar suas leituras, baixar materiais e salvar seus favoritos por aqui.
              </p>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
