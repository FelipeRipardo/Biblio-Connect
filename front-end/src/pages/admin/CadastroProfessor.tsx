import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/http';
import { cadastrarProfessor } from '../../api/professores';
import { CampoSenha } from '../../components/CampoSenha';
import { Chips } from '../../components/Chips';
import { ForcaSenha } from '../../components/ForcaSenha';
import type { ProfessorCadastroRequest } from '../../types/api';
import { DISCIPLINAS, emailValido } from '../../utils/escola';
import { mascaraCpf, mascaraTelefone } from '../../utils/masks';
import { REGRA_SENHA, senhaForte } from '../../utils/senha';
import { AdminLayout, idDoAdmin } from './AdminLayout';

type Formulario = Required<ProfessorCadastroRequest> & { confirmarSenha: string };

const FORMULARIO_INICIAL: Formulario = {
  nome: '',
  email: '',
  cpf: '',
  telefone: '',
  registroFuncional: '',
  disciplinas: [],
  turmas: [],
  senha: '',
  confirmarSenha: '',
  comprovanteVinculo: '',
};

//Mesmas mensagens do ProfessorCadastroDTO, do ProfessorService e do SenhaValidator
function validar(f: Formulario): string | null {
  if (!f.nome.trim()) return 'O nome completo é obrigatório';
  if (!f.email.trim()) return 'O e-mail institucional é obrigatório';
  if (!emailValido(f.email)) return 'E-mail inválido';
  if (f.cpf.length !== 14) return 'Informe o CPF completo';
  if (!f.telefone.trim()) return 'O telefone é obrigatório';
  if (!f.registroFuncional.trim()) return 'O registro funcional é obrigatório';
  if (f.disciplinas.length === 0) return 'Selecione pelo menos uma disciplina';
  if (f.turmas.length === 0) return 'Selecione pelo menos uma turma';
  if (!f.senha) return 'A senha inicial é obrigatória';
  if (!senhaForte(f.senha)) return REGRA_SENHA;
  if (f.senha !== f.confirmarSenha) return 'As senhas não coincidem.';
  return null;
}

//Wireframe 04 - Cadastro de Professor (feito pelo Administrador)
export function CadastroProfessor() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Formulario>(FORMULARIO_INICIAL);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function atualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const erroValidacao = validar(form);
    setErro(erroValidacao);
    if (erroValidacao) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCarregando(true);
    try {
      const { confirmarSenha: _, ...dados } = form;
      const resposta = await cadastrarProfessor(idDoAdmin(), {
        ...dados,
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        registroFuncional: dados.registroFuncional.trim(),
        comprovanteVinculo: dados.comprovanteVinculo.trim() || undefined,
      });
      navigate('/admin/professores', {
        state: { mensagem: `${resposta.mensagem} E-mail de acesso: ${resposta.email}.` },
      });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
      setCarregando(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <AdminLayout titulo="Novo Professor">
      <form className="cartao formulario" onSubmit={handleSubmit} noValidate>
        <header className="formulario__cabecalho">
          <h2>Cadastro de Professor</h2>
          <p>Preencha os dados para criar a conta do professor</p>
        </header>

        {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

        <div className="campo">
          <label className="rotulo" htmlFor="nome">Nome Completo *</label>
          <input id="nome" className="input" placeholder="Digite o nome completo" maxLength={100}
            value={form.nome} onChange={(e) => atualizar('nome', e.target.value)} />
        </div>
        <div className="linha">
          <div className="campo">
            <label className="rotulo" htmlFor="email">Email Institucional *</label>
            <input id="email" className="input" type="email" placeholder="professor@escola.edu.br" maxLength={100}
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
            <label className="rotulo" htmlFor="telefone">Telefone *</label>
            <input id="telefone" className="input" type="tel" inputMode="numeric" placeholder="(00) 00000-0000"
              value={form.telefone} onChange={(e) => atualizar('telefone', mascaraTelefone(e.target.value))} />
          </div>
          <div className="campo">
            <label className="rotulo" htmlFor="registro">Registro Funcional *</label>
            <input id="registro" className="input" placeholder="Ex: RF123456" maxLength={50}
              value={form.registroFuncional} onChange={(e) => atualizar('registroFuncional', e.target.value)} />
          </div>
        </div>

        <fieldset className="campo">
          <legend className="formulario__secao">📚 Disciplinas que Leciona *</legend>
          <div className="caixa">
            <Chips valores={form.disciplinas} onChange={(v) => atualizar('disciplinas', v)} opcoes={DISCIPLINAS} cor="var(--verde)" />
            <small className="dica">Selecione todas as disciplinas que o professor leciona nesta escola</small>
          </div>
        </fieldset>

        <fieldset className="campo">
          <legend className="formulario__secao">🎓 Turmas *</legend>
          <div className="caixa">
            <Chips valores={form.turmas} onChange={(v) => atualizar('turmas', v)} placeholder="Ex: 9º A" cor="var(--roxo)" />
          </div>
        </fieldset>

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

        <div className="campo">
          <label className="rotulo" htmlFor="comprovante">Comprovante de Vínculo (opcional)</label>
          <input id="comprovante" className="input input--tracejado" maxLength={255}
            placeholder="Número ou referência do documento de vínculo"
            value={form.comprovanteVinculo} onChange={(e) => atualizar('comprovanteVinculo', e.target.value)} />
        </div>

        <div className="formulario__acoes">
          <button type="button" className="botao botao--secundario" onClick={() => navigate('/admin/professores')} disabled={carregando}>
            ← Cancelar
          </button>
          <button type="submit" className="botao botao--verde" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
