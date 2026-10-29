import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { autenticar } from '../api/auth';
import { ApiError } from '../api/http';
import { salvarSessao } from '../api/sessao';
import type { Perfil } from '../types/api';
import { AcessoLayout } from './AcessoLayout';
import { CampoSenha } from './CampoSenha';

type PerfilLogin = Exclude<Perfil, 'GESTOR'>;

interface ConfigPerfil {
  rotulo: string;
  icone: string;
  campo: string;
  placeholder: string;
  tipoCampo: 'text' | 'email';
  rota: string;
}

//O AuthService só aceita matrícula para Aluno e e-mail para Professor/Administrador
export const CONFIG_PERFIS: Record<PerfilLogin, ConfigPerfil> = {
  ALUNO: { rotulo: 'Aluno', icone: '👨‍🎓', campo: 'Matrícula', placeholder: 'Ex: 2024001234', tipoCampo: 'text', rota: '/login' },
  PROFESSOR: { rotulo: 'Professor', icone: '👨‍🏫', campo: 'Email institucional', placeholder: 'seu.email@escola.edu.br', tipoCampo: 'email', rota: '/login/professor' },
  ADMINISTRADOR: { rotulo: 'Admin', icone: '👤', campo: 'Email institucional', placeholder: 'seu.email@escola.edu.br', tipoCampo: 'email', rota: '/login/administrador' },
};

//Página inicial de cada perfil após o login
export function destinoDoPerfil(perfil: Perfil): string {
  if (perfil === 'ADMINISTRADOR') return '/admin';
  if (perfil === 'PROFESSOR') return '/professor';
  return '/aluno';
}

export const rotaLoginDoPerfil = (perfil: Perfil) => (perfil === 'GESTOR' ? '/login' : CONFIG_PERFIS[perfil].rota);

interface LoginFormProps {
  perfil: PerfilLogin;
}

//Tela de login (wireframe 02). Cada perfil tem a própria rota; o seletor "Sou:" navega entre elas.
export function LoginForm({ perfil }: LoginFormProps) {
  const navigate = useNavigate();
  //Mensagem enviada por outras telas (ex.: após redefinir a senha)
  const mensagemRecebida = (useLocation().state as { mensagem?: string } | null)?.mensagem;
  const config = CONFIG_PERFIS[perfil];
  const ehAluno = perfil === 'ALUNO';

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  //Mesmas regras do AuthService, para avisar antes de chamar a API
  function validar(): string | null {
    const id = identificador.trim();
    if (!id) return ehAluno ? 'Informe a sua matrícula.' : 'Informe o seu e-mail institucional.';
    if (ehAluno && id.includes('@')) {
      return 'Alunos devem realizar login utilizando exclusivamente a Matrícula Escolar.';
    }
    if (!ehAluno && !id.includes('@')) {
      return 'Para este perfil, utilize o seu E-mail Institucional para realizar login.';
    }
    if (!senha) return 'A senha é obrigatória.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const erroValidacao = validar();
    setErro(erroValidacao);
    if (erroValidacao) return;

    setCarregando(true);
    try {
      const usuario = salvarSessao(await autenticar({ identificador: identificador.trim(), senha, perfil }), lembrar);
      navigate(destinoDoPerfil(usuario.perfil), { replace: true });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
      setCarregando(false);
    }
  }

  return (
    <AcessoLayout>
      <form className="acesso__form" onSubmit={handleSubmit} noValidate>
        <header className="acesso__cabecalho">
          <h2>Entrar</h2>
          <p>Acesse sua conta para continuar</p>
        </header>

        {mensagemRecebida && !erro && (
          <div className="alerta alerta--sucesso" role="status">
            {mensagemRecebida}
          </div>
        )}
        {erro && (
          <div className="alerta alerta--erro" role="alert">
            {erro}
          </div>
        )}

        <nav className="campo" aria-label="Perfil de acesso">
          <span className="rotulo">Sou:</span>
          <div className="perfis">
            {(Object.keys(CONFIG_PERFIS) as PerfilLogin[]).map((p) => (
              <Link
                key={p}
                to={CONFIG_PERFIS[p].rota}
                replace
                className={`perfil ${p === perfil ? 'perfil--ativo' : ''}`}
                aria-current={p === perfil ? 'page' : undefined}
              >
                <span aria-hidden="true">{CONFIG_PERFIS[p].icone}</span> {CONFIG_PERFIS[p].rotulo}
              </Link>
            ))}
          </div>
        </nav>

        <div className="campo">
          <label className="rotulo" htmlFor="identificador">{config.campo}</label>
          <input
            id="identificador"
            className="input input--grande"
            type={config.tipoCampo}
            autoComplete="username"
            placeholder={config.placeholder}
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
          />
        </div>

        <div className="campo">
          <label className="rotulo" htmlFor="senha">Senha</label>
          <CampoSenha
            id="senha"
            className="input input--grande"
            autoComplete="current-password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <div className="acesso__opcoes">
          <label className="checkbox">
            <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
            Lembrar de mim
          </label>
          <Link to="/esqueci-senha" state={{ voltarPara: config.rota }}>
            Esqueci minha senha
          </Link>
        </div>

        <button type="submit" className="botao botao--primario botao--bloco" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        {/* Não há cadastro público: as contas são criadas pelo Administrador */}
        <p className="acesso__rodape">Primeiro acesso? Procure a secretaria da escola para receber seus dados de login.</p>
      </form>
    </AcessoLayout>
  );
}
