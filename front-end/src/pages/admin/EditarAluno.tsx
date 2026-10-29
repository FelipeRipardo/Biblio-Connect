import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { atualizarAluno, buscarAluno } from '../../api/alunos';
import { ApiError } from '../../api/http';
import { Avatar } from '../../components/Avatar';
import type { Aluno, AlunoAtualizacaoRequest } from '../../types/api';
import { SERIES, TURMAS, TURNOS, emailValido, opcoesCom, serieTurmaCurta } from '../../utils/escola';
import { mascaraTelefone } from '../../utils/masks';
import { AdminLayout, idDoAdmin } from './AdminLayout';

const mensagemDeErro = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.';

const paraFormulario = (a: Aluno): AlunoAtualizacaoRequest => ({
  nome: a.nome,
  email: a.email,
  dataNascimento: a.dataNascimento,
  telefoneResponsavel: a.telefoneResponsavel,
  serie: a.serie,
  turma: a.turma,
  turno: a.turno,
});

//Mesmas mensagens do AlunoAtualizacaoDTO
function validar(f: AlunoAtualizacaoRequest): string | null {
  if (!f.nome.trim()) return 'O nome é obrigatório';
  if (!f.email.trim()) return 'O email é obrigatório';
  if (!emailValido(f.email)) return 'Email inválido';
  if (!f.dataNascimento) return 'A data de nascimento é obrigatória';
  if (!f.telefoneResponsavel.trim()) return 'O telefone do responsável é obrigatório';
  return null;
}

//Wireframe 18 - Atualizar Cadastro do Aluno (feito pelo Administrador)
export function EditarAluno() {
  const id = Number(useParams().id);
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [form, setForm] = useState<AlunoAtualizacaoRequest | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    buscarAluno(id)
      .then((a) => {
        setAluno(a);
        setForm(paraFormulario(a));
      })
      .catch((err) => setErro(mensagemDeErro(err)));
  }, [id]);

  function atualizar<K extends keyof AlunoAtualizacaoRequest>(campo: K, valor: AlunoAtualizacaoRequest[K]) {
    setForm((atual) => (atual ? { ...atual, [campo]: valor } : atual));
    setSucesso(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const erroValidacao = validar(form);
    setErro(erroValidacao);
    if (erroValidacao) return;

    setCarregando(true);
    try {
      const atualizado = await atualizarAluno(idDoAdmin(), id, { ...form, nome: form.nome.trim(), email: form.email.trim() });
      setAluno(atualizado);
      setForm(paraFormulario(atualizado));
      setSucesso('✓ Dados atualizados com sucesso!');
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AdminLayout titulo="Atualizar Cadastro - Aluno">
      {!aluno || !form ? (
        erro ? (
          <div className="alerta alerta--erro" role="alert">{erro} <Link to="/admin/alunos">Voltar para a lista</Link></div>
        ) : (
          <p className="vazio">Carregando...</p>
        )
      ) : (
        <form className="cartao formulario" onSubmit={handleSubmit} noValidate>
          <header className="perfil-cabecalho">
            <Avatar nome={aluno.nome} id={aluno.id} tamanho={64} />
            <div>
              <h2>{aluno.nome}</h2>
              <span>{aluno.email}</span>
              <div className="etiquetas">
                <span className="etiqueta etiqueta--azul">Aluno</span>
                <span className="etiqueta etiqueta--verde">{serieTurmaCurta(aluno.serie, aluno.turma)}</span>
              </div>
            </div>
          </header>

          {sucesso && <div className="alerta alerta--sucesso" role="status">{sucesso}</div>}
          {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

          <h3 className="formulario__secao">Dados Pessoais</h3>
          <div className="linha">
            <div className="campo">
              <label className="rotulo" htmlFor="nome">Nome Completo *</label>
              <input id="nome" className="input" maxLength={100} value={form.nome} onChange={(e) => atualizar('nome', e.target.value)} />
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="matricula">Matrícula 🔒</label>
              <input id="matricula" className="input" value={aluno.matricula} disabled />
            </div>
          </div>
          <div className="linha">
            <div className="campo">
              <label className="rotulo" htmlFor="email">Email *</label>
              <input id="email" className="input" type="email" maxLength={100} value={form.email} onChange={(e) => atualizar('email', e.target.value)} />
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="telefone">Telefone do Responsável *</label>
              <input id="telefone" className="input" type="tel" inputMode="numeric" value={form.telefoneResponsavel}
                onChange={(e) => atualizar('telefoneResponsavel', mascaraTelefone(e.target.value))} />
            </div>
          </div>
          <div className="linha">
            <div className="campo">
              <label className="rotulo" htmlFor="dataNascimento">Data de Nascimento *</label>
              <input id="dataNascimento" className="input" type="date" value={form.dataNascimento}
                onChange={(e) => atualizar('dataNascimento', e.target.value)} />
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="cpf">CPF 🔒</label>
              <input id="cpf" className="input" value={aluno.cpf} disabled />
            </div>
          </div>

          <h3 className="formulario__secao">Dados Escolares</h3>
          <div className="linha linha--3">
            <div className="campo">
              <label className="rotulo" htmlFor="serie">Série/Ano</label>
              <select id="serie" className="input" value={form.serie} onChange={(e) => atualizar('serie', e.target.value)}>
                {opcoesCom(SERIES, form.serie).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="turma">Turma</label>
              <select id="turma" className="input" value={form.turma} onChange={(e) => atualizar('turma', e.target.value)}>
                {opcoesCom(TURMAS, form.turma).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="turno">Turno</label>
              <select id="turno" className="input" value={form.turno} onChange={(e) => atualizar('turno', e.target.value)}>
                {opcoesCom(TURNOS, form.turno).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="alerta alerta--info">
            ℹ️ Campos com 🔒 (matrícula e CPF) não podem ser alterados depois do cadastro.
          </div>

          <div className="formulario__acoes">
            <Link className="botao botao--secundario" to="/admin/alunos">Cancelar</Link>
            <button type="submit" className="botao botao--verde" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
