import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cadastrarAluno } from '../api/alunos';
import { ApiError } from '../api/http';
import { AuthLayout } from '../components/AuthLayout';
import { CampoSenha } from '../components/CampoSenha';
import type { AlunoCadastroRequest } from '../types/api';
import { mascaraCpf, mascaraTelefone } from '../utils/masks';

const PASSOS = ['Dados Pessoais', 'Dados Escolares', 'Confirmação'];

const SERIES = [
  '6º Ano - Fundamental',
  '7º Ano - Fundamental',
  '8º Ano - Fundamental',
  '9º Ano - Fundamental',
  '1ª Série - Médio',
  '2ª Série - Médio',
  '3ª Série - Médio',
];
const TURMAS = ['Turma A', 'Turma B', 'Turma C', 'Turma D', 'Turma E'];
const TURNOS = ['Manhã', 'Tarde', 'Noite'];

const FORMULARIO_INICIAL: AlunoCadastroRequest = {
  nome: '',
  email: '',
  cpf: '',
  dataNascimento: '',
  telefoneResponsavel: '',
  matricula: '',
  serie: SERIES[3],
  turma: TURMAS[0],
  turno: TURNOS[0],
  senha: '',
  confirmarSenha: '',
  termosAceitos: false,
};

//Validação por etapa, com as mesmas mensagens do AlunoCadastroDTO e do AlunoService
function validarPasso(passo: number, f: AlunoCadastroRequest): string | null {
  if (passo === 0) {
    if (!f.nome.trim()) return 'O nome é obrigatório';
    if (!f.email.trim()) return 'O email é obrigatório';
    if (!/^[^\s@]+@[^\s@]+$/.test(f.email.trim())) return 'Email inválido';
    if (!f.cpf.trim()) return 'O CPF é obrigatório';
    if (!f.dataNascimento) return 'A data de nascimento é obrigatória';
    if (!f.telefoneResponsavel.trim()) return 'O telefone do responsável é obrigatório';
  }
  if (passo === 1) {
    if (!f.matricula.trim()) return 'A matrícula é obrigatória';
  }
  if (passo === 2) {
    if (!f.senha.trim()) return 'A senha é obrigatória';
    if (!f.confirmarSenha.trim()) return 'A confirmação de senha é obrigatória';
    if (f.senha !== f.confirmarSenha) return 'As senhas não coincidem.';
    if (!f.termosAceitos) return 'Você precisa aceitar os Termos de Uso e Regulamento.';
  }
  return null;
}

//Leva o usuário de volta à etapa do campo que o back-end recusou (email/CPF/matrícula já cadastrados)
function passoDoErro(mensagem: string): number | null {
  const texto = mensagem.toLowerCase();
  if (texto.includes('email') || texto.includes('cpf')) return 0;
  if (texto.includes('matrícula')) return 1;
  return null;
}

export function Cadastro() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(0);
  const [form, setForm] = useState<AlunoCadastroRequest>(FORMULARIO_INICIAL);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function atualizar<K extends keyof AlunoCadastroRequest>(campo: K, valor: AlunoCadastroRequest[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function voltar() {
    setErro(null);
    setPasso((p) => p - 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const erroValidacao = validarPasso(passo, form);
    setErro(erroValidacao);
    if (erroValidacao) return;

    if (passo < PASSOS.length - 1) {
      setPasso((p) => p + 1);
      return;
    }

    setCarregando(true);
    try {
      const resposta = await cadastrarAluno({
        ...form,
        nome: form.nome.trim(),
        email: form.email.trim(),
        matricula: form.matricula.trim(),
      });
      navigate('/login', {
        replace: true,
        state: { mensagem: `${resposta.mensagem} Faça login com sua matrícula.`, matricula: form.matricula.trim() },
      });
    } catch (err) {
      const mensagem = err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.';
      const passoComErro = passoDoErro(mensagem);
      if (passoComErro !== null) setPasso(passoComErro);
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthLayout
      titulo={
        <>
          Junte-se à nossa
          <br />
          comunidade escolar!
        </>
      }
      subtitulo={
        <>
          Crie sua conta e tenha acesso
          <br />
          aos livros didáticos da escola.
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <header className="form__cabecalho">
          <h2>Cadastro de Aluno</h2>
          <p>Preencha os dados para criar sua conta</p>
        </header>

        <ol className="etapas">
          {PASSOS.map((nome, i) => (
            <li
              key={nome}
              className={`etapa ${i === passo ? 'etapa--atual' : ''} ${i < passo ? 'etapa--concluida' : ''}`}
              aria-current={i === passo ? 'step' : undefined}
            >
              <span className="etapa__numero">{i < passo ? '✓' : i + 1}</span>
              <span className="etapa__nome">{nome}</span>
            </li>
          ))}
        </ol>

        {erro && (
          <div className="alerta alerta--erro" role="alert">
            {erro}
          </div>
        )}

        {passo === 0 && (
          <>
            <div className="campo">
              <label className="rotulo" htmlFor="nome">Nome Completo *</label>
              <input id="nome" className="input" autoComplete="name" placeholder="Digite seu nome completo" maxLength={100}
                value={form.nome} onChange={(e) => atualizar('nome', e.target.value)} />
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="email">Email *</label>
              <input id="email" className="input" type="email" autoComplete="email" placeholder="seu@email.com" maxLength={100}
                value={form.email} onChange={(e) => atualizar('email', e.target.value)} />
            </div>
            <div className="linha">
              <div className="campo">
                <label className="rotulo" htmlFor="cpf">CPF *</label>
                <input id="cpf" className="input" inputMode="numeric" placeholder="000.000.000-00"
                  value={form.cpf} onChange={(e) => atualizar('cpf', mascaraCpf(e.target.value))} />
              </div>
              <div className="campo">
                <label className="rotulo" htmlFor="dataNascimento">Data de Nascimento *</label>
                <input id="dataNascimento" className="input" type="date"
                  value={form.dataNascimento} onChange={(e) => atualizar('dataNascimento', e.target.value)} />
              </div>
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="telefone">Telefone do Responsável *</label>
              <input id="telefone" className="input" type="tel" inputMode="numeric" placeholder="(00) 00000-0000"
                value={form.telefoneResponsavel} onChange={(e) => atualizar('telefoneResponsavel', mascaraTelefone(e.target.value))} />
            </div>
          </>
        )}

        {passo === 1 && (
          <>
            <div className="campo">
              <label className="rotulo" htmlFor="matricula">Matrícula Escolar *</label>
              <input id="matricula" className="input" placeholder="Ex: 2024001234" maxLength={50}
                value={form.matricula} onChange={(e) => atualizar('matricula', e.target.value)} />
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="serie">Série/Ano *</label>
              <select id="serie" className="input" value={form.serie} onChange={(e) => atualizar('serie', e.target.value)}>
                {SERIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="linha">
              <div className="campo">
                <label className="rotulo" htmlFor="turma">Turma *</label>
                <select id="turma" className="input" value={form.turma} onChange={(e) => atualizar('turma', e.target.value)}>
                  {TURMAS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="campo">
                <label className="rotulo" htmlFor="turno">Turno *</label>
                <select id="turno" className="input" value={form.turno} onChange={(e) => atualizar('turno', e.target.value)}>
                  {TURNOS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        {passo === 2 && (
          <>
            <div className="campo">
              <label className="rotulo" htmlFor="senha">Criar Senha *</label>
              <CampoSenha id="senha" autoComplete="new-password" placeholder="••••••••"
                value={form.senha} onChange={(e) => atualizar('senha', e.target.value)} />
            </div>
            <div className="campo">
              <label className="rotulo" htmlFor="confirmarSenha">Confirmar Senha *</label>
              <CampoSenha id="confirmarSenha" autoComplete="new-password" placeholder="••••••••"
                value={form.confirmarSenha} onChange={(e) => atualizar('confirmarSenha', e.target.value)} />
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={form.termosAceitos} onChange={(e) => atualizar('termosAceitos', e.target.checked)} />
              <span>Li e concordo com os <strong>Termos de Uso</strong> e <strong>Regulamento da Biblioteca</strong></span>
            </label>
          </>
        )}

        <div className="form__acoes">
          {passo > 0 && (
            <button type="button" className="botao botao--secundario" onClick={voltar} disabled={carregando}>
              ← Voltar
            </button>
          )}
          <button type="submit" className="botao botao--primario" disabled={carregando}>
            {passo < PASSOS.length - 1 ? 'Próximo →' : carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </div>

        <p className="form__rodape">
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
