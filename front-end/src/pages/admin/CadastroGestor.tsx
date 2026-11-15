import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { cadastrarGestor } from '../../api/gestores';
import { ApiError } from '../../api/http';
import { CampoSenha } from '../../components/CampoSenha';
import { ForcaSenha } from '../../components/ForcaSenha';
import type { GestorCadastroRequest } from '../../types/api';
import { emailValido } from '../../utils/escola';
import { REGRA_SENHA, senhaForte } from '../../utils/senha';
import { AdminLayout } from './AdminLayout';

type Formulario = GestorCadastroRequest & { confirmarSenha: string };

const FORMULARIO_INICIAL: Formulario = { nome: '', email: '', senha: '', confirmarSenha: '' };

//Mesmas mensagens do GestorCadastroDTO e do SenhaValidator
function validar(f: Formulario): string | null {
  if (!f.nome.trim()) return 'O nome é obrigatório';
  if (!f.email.trim()) return 'O e-mail institucional é obrigatório';
  if (!emailValido(f.email)) return 'E-mail inválido';
  if (!f.senha) return 'A senha inicial é obrigatória';
  if (!senhaForte(f.senha)) return REGRA_SENHA;
  if (f.senha !== f.confirmarSenha) return 'As senhas não coincidem.';
  return null;
}

//Cadastro de Gestor (feito pelo Administrador), no padrão do wireframe 04
export function CadastroGestor() {
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
    if (erroValidacao) return;

    setCarregando(true);
    try {
      const resposta = await cadastrarGestor({ nome: form.nome.trim(), email: form.email.trim(), senha: form.senha });
      navigate('/admin/gestores', {
        state: { mensagem: `${resposta.mensagem} E-mail de acesso: ${resposta.email}.` },
      });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
      setCarregando(false);
    }
  }

  return (
    <AdminLayout titulo="Novo Gestor">
      <form className="cartao formulario" onSubmit={handleSubmit} noValidate>
        <header className="formulario__cabecalho">
          <h2>Cadastro de Gestor</h2>
          <p>O gestor entra com o e-mail institucional e pode cadastrar, editar e excluir materiais do acervo</p>
        </header>

        {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

        <div className="campo">
          <label className="rotulo" htmlFor="nome">Nome Completo *</label>
          <input id="nome" className="input" placeholder="Digite o nome completo" maxLength={150}
            value={form.nome} onChange={(e) => atualizar('nome', e.target.value)} />
        </div>
        <div className="campo">
          <label className="rotulo" htmlFor="email">Email Institucional *</label>
          <input id="email" className="input" type="email" placeholder="gestor@escola.edu.br" maxLength={150}
            value={form.email} onChange={(e) => atualizar('email', e.target.value)} />
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

        <div className="caixa caixa--info">
          <small className="dica">🔒 Depois de criada, a conta do gestor não pode ser editada nem excluída. Confira os dados antes de cadastrar.</small>
        </div>

        <div className="formulario__acoes">
          <button type="button" className="botao botao--secundario" onClick={() => navigate('/admin/gestores')} disabled={carregando}>
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
