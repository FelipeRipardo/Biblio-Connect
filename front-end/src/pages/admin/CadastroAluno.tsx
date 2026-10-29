import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { cadastrarAluno } from '../../api/alunos';
import { ApiError } from '../../api/http';
import { CampoSenha } from '../../components/CampoSenha';
import { ForcaSenha } from '../../components/ForcaSenha';
import type { AlunoCadastroRequest } from '../../types/api';
import { SERIES, TURMAS, TURNOS, emailValido } from '../../utils/escola';
import { mascaraCpf, mascaraTelefone } from '../../utils/masks';
import { REGRA_SENHA, senhaForte } from '../../utils/senha';
import { AdminLayout, idDoAdmin } from './AdminLayout';

const PASSOS = ['Dados Pessoais', 'Dados Escolares', 'Confirmação'];

type Formulario = AlunoCadastroRequest & { confirmarSenha: string };

const FORMULARIO_INICIAL: Formulario = {
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
};

//Validação por etapa, com as mesmas mensagens do AlunoCadastroDTO, do AlunoService e do SenhaValidator
function validarPasso(passo: number, f: Formulario): string | null {
  if (passo === 0) {
    if (!f.nome.trim()) return 'O nome é obrigatório';
    if (!f.email.trim()) return 'O email é obrigatório';
    if (!emailValido(f.email)) return 'Email inválido';
    if (f.cpf.length !== 14) return 'Informe o CPF completo';
    if (!f.dataNascimento) return 'A data de nascimento é obrigatória';
    if (!f.telefoneResponsavel.trim()) return 'O telefone do responsável é obrigatório';
  }
  if (passo === 1) {
    if (!f.matricula.trim()) return 'A matrícula é obrigatória';
    if (f.matricula.includes('@')) return 'A matrícula não pode conter "@", pois é usada no login do aluno.';
    if (!f.senha) return 'A senha inicial é obrigatória';
    if (!senhaForte(f.senha)) return REGRA_SENHA;
    if (f.senha !== f.confirmarSenha) return 'As senhas não coincidem.';
  }
  return null;
}

//Leva o administrador de volta à etapa do campo recusado pelo back-end (email/CPF/matrícula já cadastrados)
function passoDoErro(mensagem: string): number | null {
  const texto = mensagem.toLowerCase();
  if (texto.includes('email') || texto.includes('cpf')) return 0;
  if (texto.includes('matrícula') || texto.includes('senha')) return 1;
  return null;
}

const dataBr = (iso: string) => iso.split('-').reverse().join('/');

//Wireframe 03 - Cadastro de Aluno (feito pelo Administrador)
export function CadastroAluno() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(0);
  const [form, setForm] = useState<Formulario>(FORMULARIO_INICIAL);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function atualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  function voltar() {
    setErro(null);
    if (passo === 0) navigate('/admin/alunos');
    else setPasso((p) => p - 1);
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
      const { confirmarSenha: _, ...dados } = form;
      const resposta = await cadastrarAluno(idDoAdmin(), {
        ...dados,
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        matricula: dados.matricula.trim(),
      });
      navigate('/admin/alunos', {
        state: { mensagem: `${resposta.mensagem} Matrícula de acesso: ${resposta.matricula}.` },
      });
    } catch (err) {
      const mensagem = err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.';
      const passoComErro = passoDoErro(mensagem);
      if (passoComErro !== null) setPasso(passoComErro);
      setErro(mensagem);
      setCarregando(false);
    }
  }

  const resumo = [
    ['Nome', form.nome],
    ['Email', form.email],
    ['CPF', form.cpf],
    ['Data de Nascimento', dataBr(form.dataNascimento)],
    ['Telefone do Responsável', form.telefoneResponsavel],
    ['Matrícula', form.matricula],
    ['Série/Ano', form.serie],
    ['Turma', form.turma],
    ['Turno', form.turno],
  ];

  return (
    <AdminLayout titulo="Novo Aluno">
      <form className="cartao formulario" onSubmit={handleSubmit} noValidate>
        <header className="formulario__cabecalho">
          <h2>Cadastro de Aluno</h2>
          <p>Preencha os dados para criar a conta do aluno</p>
        </header>

        <ol className="etapas">
          {PASSOS.map((nome, i) => (
            <li
              key={nome}
              className={`etapa ${i === passo ? 'etapa--atual' : ''} ${i < passo ? 'etapa--concluida' : ''}`}
              aria-current={i === passo ? 'step' : undefined}
            >
              <span className="etapa__numero">{i < passo ? '✓' : i + 1}</span>
              <span>{nome}</span>
            </li>
          ))}
        </ol>

        {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

        {passo === 0 && (
          <>
            <div className="campo">
              <label className="rotulo" htmlFor="nome">Nome Completo *</label>
              <input id="nome" className="input" placeholder="Digite o nome completo" maxLength={100}
                value={form.nome} onChange={(e) => atualizar('nome', e.target.value)} />
            </div>
            <div className="linha">
              <div className="campo">
                <label className="rotulo" htmlFor="email">Email *</label>
                <input id="email" className="input" type="email" placeholder="aluno@email.com" maxLength={100}
                  value={form.email} onChange={(e) => atualizar('email', e.target.value)} />
              </div>
              <div className="campo">
                <label className="rotulo" htmlFor="cpf">CPF *</label>
                <input id="cpf" className="input" inputMode="numeric" placeholder="000.000.000-00"
                  value={form.cpf} onChange={(e) => atualizar('cpf', mascaraCpf(e.target.value))} />
              </div>
            </div>
            <div className="linha">
              <div className="campo">
                <label className="rotulo" htmlFor="dataNascimento">Data de Nascimento *</label>
                <input id="dataNascimento" className="input" type="date" max={new Date().toISOString().slice(0, 10)}
                  value={form.dataNascimento} onChange={(e) => atualizar('dataNascimento', e.target.value)} />
              </div>
              <div className="campo">
                <label className="rotulo" htmlFor="telefone">Telefone do Responsável *</label>
                <input id="telefone" className="input" type="tel" inputMode="numeric" placeholder="(00) 00000-0000"
                  value={form.telefoneResponsavel} onChange={(e) => atualizar('telefoneResponsavel', mascaraTelefone(e.target.value))} />
              </div>
            </div>
          </>
        )}

        {passo === 1 && (
          <>
            <div className="linha">
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
            <div className="linha">
              <div className="campo">
                <label className="rotulo" htmlFor="senha">Senha Inicial *</label>
                <CampoSenha id="senha" autoComplete="new-password" placeholder="••••••••"
                  value={form.senha} onChange={(e) => atualizar('senha', e.target.value)} />
              </div>
              <div className="campo">
                <label className="rotulo" htmlFor="confirmarSenha">Confirmar Senha *</label>
                <CampoSenha id="confirmarSenha" autoComplete="new-password" placeholder="••••••••"
                  value={form.confirmarSenha} onChange={(e) => atualizar('confirmarSenha', e.target.value)} />
              </div>
            </div>
            <ForcaSenha senha={form.senha} />
            <small className="dica">{REGRA_SENHA}</small>
          </>
        )}

        {passo === 2 && (
          <>
            <dl className="resumo">
              {resumo.map(([rotulo, valor]) => (
                <div key={rotulo}>
                  <dt>{rotulo}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
            </dl>
            <div className="alerta alerta--info">
              O aluno fará login com a matrícula <strong>{form.matricula}</strong> e a senha inicial definida.
            </div>
          </>
        )}

        <div className="formulario__acoes">
          <button type="button" className="botao botao--secundario" onClick={voltar} disabled={carregando}>
            {passo === 0 ? '← Cancelar' : '← Voltar'}
          </button>
          <button type="submit" className="botao botao--verde" disabled={carregando}>
            {passo < PASSOS.length - 1 ? 'Próximo →' : carregando ? 'Cadastrando...' : 'Cadastrar Aluno'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
