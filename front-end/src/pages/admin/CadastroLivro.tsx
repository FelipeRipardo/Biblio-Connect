import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { atualizarMaterial, buscarMaterial, cadastrarMaterial, listarMateriais } from '../../api/materiais';
import { obterSessao } from '../../api/sessao';
import { GestaoAcervoLayout } from '../../components/GestaoAcervoLayout';
import type { CategoriaMaterial, Material, MaterialRequest, TipoMaterial, Visibilidade } from '../../types/api';
import { CATEGORIAS, TIPOS_MATERIAL, VISIBILIDADES, rotaGestaoAcervo, urlSegura, visualDisciplina } from '../../utils/acervo';
import { DISCIPLINAS, SERIES, distintos, opcoesCom } from '../../utils/escola';

interface Formulario {
  isbn: string;
  titulo: string;
  autor: string;
  editora: string;
  capaUrl: string;
  disciplina: string;
  serie: string;
  ano: string;
  tipoMaterial: TipoMaterial;
  categoria: CategoriaMaterial;
  urlArquivo: string;
  descricao: string;
  visibilidade: Visibilidade | '';
}

const FORMULARIO_INICIAL: Formulario = {
  isbn: '',
  titulo: '',
  autor: '',
  editora: '',
  capaUrl: '',
  disciplina: '',
  serie: '',
  ano: String(new Date().getFullYear()),
  tipoMaterial: 'LIVRO',
  categoria: 'DIDATICO',
  urlArquivo: '',
  descricao: '',
  visibilidade: '', //O gestor precisa escolher conscientemente se o material pode ser baixado
};

//Mesmas regras e mensagens do MaterialRequestDTO
function validar(f: Formulario): string | null {
  if (!f.titulo.trim()) return 'O título do material é obrigatório';
  if (!f.autor.trim()) return 'O autor é obrigatório';
  if (f.capaUrl.trim() && !urlSegura(f.capaUrl)) return 'O link da capa deve começar com http:// ou https://';
  if (!f.disciplina) return 'A disciplina vinculada é obrigatória';
  if (!f.serie) return 'A série recomendada é obrigatória';
  const ano = Number(f.ano);
  if (!f.ano.trim() || !Number.isInteger(ano)) return 'O ano de publicação é obrigatório';
  if (ano < 1500) return 'Informe um ano de publicação válido';
  if (ano > 2030) return 'O ano de publicação não pode ser superior a 2030';
  if (!f.urlArquivo.trim()) return 'A URL do arquivo digital (PDF/E-book) é obrigatória';
  if (!urlSegura(f.urlArquivo)) return 'O link do arquivo deve começar com http:// ou https://';
  if (!f.descricao.trim()) return 'A descrição/sinopse do material é obrigatória';
  if (!f.visibilidade) return 'Informe se o material é público ou interno';
  return null;
}

const opcional = (valor: string) => valor.trim() || undefined;

//Preenche o formulário de edição com o material salvo (campos opcionais podem vir nulos)
const paraFormulario = (m: Material): Formulario => ({
  isbn: m.isbn ?? '',
  titulo: m.titulo,
  autor: m.autor,
  editora: m.editora ?? '',
  capaUrl: m.capaUrl ?? '',
  disciplina: m.disciplina ?? '',
  serie: m.serie ?? '',
  ano: m.ano ? String(m.ano) : '',
  tipoMaterial: m.tipoMaterial,
  categoria: m.categoria,
  urlArquivo: m.urlArquivo ?? '',
  descricao: m.descricao ?? '',
  visibilidade: m.visibilidade ?? '',
});

const paraRequisicao = (f: Formulario): MaterialRequest => ({
  titulo: f.titulo.trim(),
  autor: f.autor.trim(),
  categoria: f.categoria,
  tipoMaterial: f.tipoMaterial,
  ano: Number(f.ano),
  serie: f.serie,
  disciplina: f.disciplina,
  descricao: f.descricao.trim(),
  isbn: opcional(f.isbn),
  editora: opcional(f.editora),
  urlArquivo: f.urlArquivo.trim(),
  capaUrl: opcional(f.capaUrl),
  visibilidade: f.visibilidade as Visibilidade, //Garantido pela validação
});

//Wireframe 05 - Cadastro de Livro, com os campos que o back-end (MaterialRequestDTO) aceita.
//Com um :id na rota, o mesmo formulário edita o material (PUT /api/materiais/{id}).
export function CadastroLivro() {
  const navigate = useNavigate();
  const { id } = useParams();
  const edicao = id !== undefined;
  const listaLivros = rotaGestaoAcervo(obterSessao()?.perfil);
  const [form, setForm] = useState<Formulario>(FORMULARIO_INICIAL);
  const [original, setOriginal] = useState<Material | null>(null);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [acervo, setAcervo] = useState<Material[] | null>(null);
  const [capaFalhou, setCapaFalhou] = useState(false);

  useEffect(() => {
    listarMateriais().then(setAcervo).catch(() => setAcervo([]));
  }, []);

  useEffect(() => {
    if (!edicao) return;
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
      setErroCarga('Material não encontrado.');
      return;
    }
    let ativo = true;
    buscarMaterial(numero)
      .then((m) => {
        if (!ativo) return;
        setOriginal(m);
        setForm(paraFormulario(m));
      })
      .catch((err) => ativo && setErroCarga(err instanceof ApiError ? err.message : 'Não foi possível carregar o material.'));
    return () => {
      ativo = false;
    };
  }, [edicao, id]);

  function atualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (campo === 'capaUrl') setCapaFalhou(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const erroValidacao = validar(form);
    setErro(erroValidacao);
    setSucesso(null);
    if (erroValidacao) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCarregando(true);
    if (original) {
      try {
        const salvo = await atualizarMaterial(original.id, paraRequisicao(form));
        navigate(listaLivros, { state: { mensagem: `"${salvo.titulo}" foi atualizado com sucesso.` } });
      } catch (err) {
        setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
        setCarregando(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      const salvo = await cadastrarMaterial(paraRequisicao(form));
      //Fica na tela para facilitar o cadastro de vários materiais seguidos
      setSucesso(`"${salvo.titulo}" foi cadastrado no acervo com sucesso.`);
      setForm(FORMULARIO_INICIAL);
      setAcervo((atual) => [salvo, ...(atual ?? [])]);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const capa = capaFalhou ? null : urlSegura(form.capaUrl);
  const recentes = acervo ? [...acervo].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 3) : null;

  return (
    <GestaoAcervoLayout
      titulo={edicao ? 'Editar Livro Didático' : 'Cadastro de Livro Didático'}
      acoes={<Link to="/acervo" className="botao botao--secundario botao--pequeno">📚 Ver acervo</Link>}
    >
      {erroCarga && (
        <div className="alerta alerta--erro" role="alert">
          {erroCarga} <Link to={listaLivros}>Voltar para a lista de livros</Link>
        </div>
      )}
      {edicao && !original && !erroCarga && <p className="vazio">Carregando material...</p>}

      {(!edicao || original) && (
        <div className="cadastro-livro">
          <form className="cartao formulario" onSubmit={handleSubmit} noValidate>
            {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}
            {sucesso && <div className="alerta alerta--sucesso" role="status">{sucesso}</div>}

            <div className="caixa caixa--info">
              <label className="rotulo" htmlFor="isbn">🔍 ISBN (opcional)</label>
              <input id="isbn" className="input" placeholder="Digite o ISBN do livro..." maxLength={30}
                value={form.isbn} onChange={(e) => atualizar('isbn', e.target.value)} />
              <small className="dica">O sistema não permite cadastrar dois materiais com o mesmo ISBN.</small>
            </div>

            <div className="cadastro-livro__principal">
              <div className="capa-previa" aria-label="Pré-visualização da capa">
                {capa ? (
                  <img src={capa} alt="Capa informada" onError={() => setCapaFalhou(true)} />
                ) : (
                  <>
                    <span aria-hidden="true">📷</span>
                    <small>Capa do Livro</small>
                    <small className="capa-previa__dica">{form.capaUrl.trim() ? 'Não foi possível carregar a imagem' : 'Informe o link abaixo'}</small>
                  </>
                )}
              </div>

              <div className="cadastro-livro__campos">
                <div className="campo">
                  <label className="rotulo" htmlFor="titulo">Título *</label>
                  <input id="titulo" className="input" placeholder="Título do livro didático" maxLength={200}
                    value={form.titulo} onChange={(e) => atualizar('titulo', e.target.value)} />
                </div>
                <div className="campo">
                  <label className="rotulo" htmlFor="autor">Autor(es) *</label>
                  <input id="autor" className="input" placeholder="Nome dos autores" maxLength={150}
                    value={form.autor} onChange={(e) => atualizar('autor', e.target.value)} />
                </div>
                <div className="campo">
                  <label className="rotulo" htmlFor="editora">Editora</label>
                  <input id="editora" className="input" placeholder="Nome da editora" maxLength={100}
                    value={form.editora} onChange={(e) => atualizar('editora', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="campo">
              <label className="rotulo" htmlFor="capaUrl">Link da imagem da capa (opcional)</label>
              <input id="capaUrl" className="input" type="url" placeholder="https://..." maxLength={500}
                value={form.capaUrl} onChange={(e) => atualizar('capaUrl', e.target.value)} />
            </div>

            <h2 className="formulario__secao">📚 Informações Didáticas</h2>

            <div className="linha linha--3">
              <div className="campo">
                <label className="rotulo" htmlFor="disciplina">Disciplina *</label>
                <select id="disciplina" className="input" value={form.disciplina} onChange={(e) => atualizar('disciplina', e.target.value)}>
                  <option value="">Selecione</option>
                  {opcoesCom(DISCIPLINAS, form.disciplina).map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="campo">
                <label className="rotulo" htmlFor="serie">Série/Ano *</label>
                <select id="serie" className="input" value={form.serie} onChange={(e) => atualizar('serie', e.target.value)}>
                  <option value="">Selecione</option>
                  {opcoesCom(SERIES, form.serie).map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="campo">
                <label className="rotulo" htmlFor="ano">Ano de Publicação *</label>
                <input id="ano" className="input" type="number" inputMode="numeric" min={1500} max={2030}
                  value={form.ano} onChange={(e) => atualizar('ano', e.target.value)} />
              </div>
            </div>

            <fieldset className="campo">
              <legend className="rotulo">Tipo de Livro *</legend>
              <div className="opcoes" role="radiogroup">
                {CATEGORIAS.map(({ valor, rotulo, icone }) => (
                  <button key={valor} type="button" role="radio" aria-checked={form.categoria === valor}
                    className={`opcao ${form.categoria === valor ? 'opcao--ativa' : ''}`}
                    onClick={() => atualizar('categoria', valor)}>
                    <span aria-hidden="true">{icone}</span> {rotulo}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="campo">
              <label className="rotulo" htmlFor="tipoMaterial">Formato do Material *</label>
              <select id="tipoMaterial" className="input" value={form.tipoMaterial}
                onChange={(e) => atualizar('tipoMaterial', e.target.value as TipoMaterial)}>
                {TIPOS_MATERIAL.map(({ valor, rotulo }) => <option key={valor} value={valor}>{rotulo}</option>)}
              </select>
            </div>

            <h2 className="formulario__secao">💻 Conteúdo Digital</h2>

            <div className="campo">
              <label className="rotulo" htmlFor="urlArquivo">Link do arquivo (PDF/E-book) *</label>
              <input id="urlArquivo" className="input" type="url" placeholder="https://..." maxLength={500}
                value={form.urlArquivo} onChange={(e) => atualizar('urlArquivo', e.target.value)} />
              <small className="dica">É este arquivo que abre no leitor da biblioteca quando o aluno clica em "Ler Agora".</small>
            </div>

            <fieldset className="campo">
              <legend className="rotulo">Acesso ao material *</legend>
              <div className="acesso-material" role="radiogroup">
                {VISIBILIDADES.map(({ valor, rotulo, icone, descricao }) => (
                  <button key={valor} type="button" role="radio" aria-checked={form.visibilidade === valor}
                    className={`acesso-material__opcao ${form.visibilidade === valor ? 'acesso-material__opcao--ativa' : ''}`}
                    onClick={() => atualizar('visibilidade', valor)}>
                    <strong><span aria-hidden="true">{icone}</span> {rotulo}</strong>
                    <small>{descricao}</small>
                  </button>
                ))}
              </div>
              <small className="dica">Essa informação aparece para todos os perfis no acervo, nos detalhes e no leitor.</small>
            </fieldset>

            <div className="campo">
              <label className="rotulo" htmlFor="descricao">Descrição/Sinopse *</label>
              <textarea id="descricao" className="input input--area" rows={4} placeholder="Resumo do conteúdo do material"
                value={form.descricao} onChange={(e) => atualizar('descricao', e.target.value)} />
            </div>

            <div className="formulario__acoes">
              <button type="button" className="botao botao--secundario" onClick={() => navigate(edicao ? listaLivros : '/acervo')} disabled={carregando}>
                Cancelar
              </button>
              {edicao ? (
                <button type="submit" className="botao botao--verde" disabled={carregando}>
                  {carregando ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              ) : (
                <button type="submit" className="botao botao--verde" disabled={carregando}>
                  {carregando ? 'Cadastrando...' : 'Cadastrar Livro'}
                </button>
              )}
            </div>
          </form>

          <aside className="cadastro-livro__lateral">
            <section className="cartao">
              <h2 className="cartao__titulo">📊 Estatísticas</h2>
              <Estatistica rotulo="Total no Acervo" cor="var(--azul-escuro)" valor={acervo?.length} />
              <Estatistica rotulo="Livros" cor="var(--verde)" valor={acervo?.filter((m) => m.tipoMaterial === 'LIVRO').length} />
              <Estatistica rotulo="Públicos / Internos" cor="var(--azul-link)"
                valor={acervo && `${acervo.filter((m) => m.visibilidade === 'PUBLICO').length} / ${acervo.filter((m) => m.visibilidade !== 'PUBLICO').length}`} />
              <Estatistica rotulo="Disciplinas Cobertas" cor="var(--laranja)" valor={acervo && distintos(acervo.map((m) => m.disciplina ?? '')).length} />
              <Estatistica rotulo="Séries Atendidas" cor="var(--roxo)" valor={acervo && distintos(acervo.map((m) => m.serie ?? '')).length} />
            </section>

            <section className="cartao">
              <h2 className="cartao__titulo">Últimos Cadastrados</h2>
              {!recentes && <p className="vazio">Carregando...</p>}
              {recentes?.length === 0 && <p className="vazio">Nenhum material cadastrado ainda.</p>}
              {recentes?.map((m) => (
                <div key={m.id} className="recente">
                  <span className="recente__capa" style={{ background: visualDisciplina(m.disciplina ?? '').cor }} aria-hidden="true" />
                  <div>
                    <strong>{m.titulo}</strong>
                    <span>{m.autor}</span>
                  </div>
                </div>
              ))}
            </section>
          </aside>
        </div>
      )}
    </GestaoAcervoLayout>
  );
}

function Estatistica({ rotulo, valor, cor }: { rotulo: string; valor: number | string | null | undefined; cor: string }) {
  return (
    <div className="estatistica">
      <span>{rotulo}</span>
      <strong style={{ color: cor }}>{valor ?? '…'}</strong>
    </div>
  );
}
