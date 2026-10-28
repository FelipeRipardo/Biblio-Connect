import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { atualizarProfessor, buscarProfessor } from '../../api/professores';
import { Avatar } from '../../components/Avatar';
import { Chips } from '../../components/Chips';
import type { Professor, ProfessorAtualizacaoRequest } from '../../types/api';
import { DISCIPLINAS, emailValido } from '../../utils/escola';
import { mascaraTelefone } from '../../utils/masks';
import { AdminLayout, idDoAdmin } from './AdminLayout';

type Formulario = Required<ProfessorAtualizacaoRequest>;

const mensagemDeErro = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.';

const paraFormulario = (p: Professor): Formulario => ({
  nome: p.nome,
  email: p.email,
  telefone: p.telefone,
  disciplinas: p.disciplinas,
  turmas: p.turmas,
  comprovanteVinculo: p.comprovanteVinculo ?? '',
});

//Mesmas mensagens do ProfessorAtualizacaoDTO
function validar(f: Formulario): string | null {
  if (!f.nome.trim()) return 'O nome completo é obrigatório';
  if (!f.email.trim()) return 'O e-mail institucional é obrigatório';
  if (!emailValido(f.email)) return 'E-mail inválido';
  if (!f.telefone.trim()) return 'O telefone é obrigatório';
  if (f.disciplinas.length === 0) return 'Selecione pelo menos uma disciplina';
  if (f.turmas.length === 0) return 'Selecione pelo menos uma turma';
  return null;
}

//Wireframe 19 - Atualizar Cadastro do Professor (feito pelo Administrador)
export function EditarProfessor() {
  const id = Number(useParams().id);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [form, setForm] = useState<Formulario | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    buscarProfessor(id)
      .then((p) => {
        setProfessor(p);
        setForm(paraFormulario(p));
      })
      .catch((err) => setErro(mensagemDeErro(err)));
  }, [id]);

  function atualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
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
      const atualizado = await atualizarProfessor(idDoAdmin(), id, {
        ...form,
        nome: form.nome.trim(),
        email: form.email.trim(),
        comprovanteVinculo: form.comprovanteVinculo.trim() || undefined,
      });
      setProfessor(atualizado);
      setForm(paraFormulario(atualizado));
      setSucesso('✓ Dados atualizados com sucesso!');
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AdminLayout titulo="Atualizar Cadastro - Professor">
      {!professor || !form ? (
        erro ? (
          <div className="alerta alerta--erro" role="alert">{erro} <Link to="/admin/professores">Voltar para a lista</Link></div>
        ) : (
          <p className="vazio">Carregando...</p>
        )
      ) : (
        <form className="cartao formulario" onSubmit={handleSubmit} noValidate>
          <header className="perfil-cabecalho">
            <Avatar nome={professor.nome} id={professor.id} tamanho={64} />
            <div>
              <h2>{professor.nome}</h2>
              <span>{professor.email}</span>
              <div className="etiquetas">
                <span className="etiqueta etiqueta--roxo">Professor</span>
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
              <label className="rotulo" htmlFor="registro">Registro Funcional 🔒</label>
              <input id="registro" className="input" value={professor.registroFuncional} disabled />
            </div>
          </div>
          <div className="linha">
            <div className="campo">
              <label className="rotulo" htmlFor="email">Email Institucional *</label>
              <input id="email" className="input" type="email" maxLength={100} value={form.email} onChange={(e) => atualizar('email', e.target.value)} />
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="telefone">Telefone *</label>
              <input id="telefone" className="input" type="tel" inputMode="numeric" value={form.telefone}
                onChange={(e) => atualizar('telefone', mascaraTelefone(e.target.value))} />
            </div>
          </div>
          <div className="linha">
            <div className="campo">
              <label className="rotulo" htmlFor="cpf">CPF 🔒</label>
              <input id="cpf" className="input" value={professor.cpf} disabled />
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="comprovante">Comprovante de Vínculo</label>
              <input id="comprovante" className="input" maxLength={255} value={form.comprovanteVinculo}
                onChange={(e) => atualizar('comprovanteVinculo', e.target.value)} />
            </div>
          </div>

          <h3 className="formulario__secao">Disciplinas que Leciona</h3>
          <div className="caixa">
            <Chips valores={form.disciplinas} onChange={(v) => atualizar('disciplinas', v)} opcoes={DISCIPLINAS} cor="var(--verde)" />
          </div>

          <h3 className="formulario__secao">Turmas Atribuídas</h3>
          <div className="caixa">
            <Chips valores={form.turmas} onChange={(v) => atualizar('turmas', v)} placeholder="Ex: 9º A" cor="var(--roxo)" />
          </div>

          <div className="alerta alerta--info">
            ℹ️ Campos com 🔒 (registro funcional e CPF) não podem ser alterados depois do cadastro.
          </div>

          <div className="formulario__acoes">
            <Link className="botao botao--secundario" to="/admin/professores">Cancelar</Link>
            <button type="submit" className="botao botao--verde" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
