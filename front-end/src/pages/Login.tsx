import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { autenticar } from '../api/auth';
import { ApiError } from '../api/http';
import { AuthLayout } from '../components/AuthLayout';
import { CampoSenha } from '../components/CampoSenha';
import type { LoginResponse, Perfil } from '../types/api';

const PERFIS: { valor: Perfil; rotulo: string; icone: string }[] = [
  { valor: 'ALUNO', rotulo: 'Aluno', icone: '👨‍🎓' },
  { valor: 'PROFESSOR', rotulo: 'Professor', icone: '👨‍🏫' },
  { valor: 'ADMINISTRADOR', rotulo: 'Admin', icone: '👤' },
];

//Estado enviado pela tela de cadastro após criar a conta
interface EstadoNavegacao {
  mensagem?: string;
  matricula?: string;
}

export function Login() {
  const estado = (useLocation().state ?? {}) as EstadoNavegacao;

  const [perfil, setPerfil] = useState<Perfil>('ALUNO');
  const [identificador, setIdentificador] = useState(estado.matricula ?? '');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<LoginResponse | null>(null);
  const [carregando, setCarregando] = useState(false);

  const ehAluno = perfil === 'ALUNO';

  function trocarPerfil(novo: Perfil) {
    if (novo === perfil) return;
    setPerfil(novo);
    setIdentificador('');
    setErro(null);
  }

  //Mesmas regras do LoginRequestDTO e do AuthService, para avisar antes de chamar a API
  function validar(): string | null {
    const id = identificador.trim();
    if (!id) {
      return ehAluno
        ? 'A matrícula é obrigatória para acessar como Aluno.'
        : 'O e-mail é obrigatório para este perfil de acesso.';
    }
    if (ehAluno && id.includes('@')) {
      return 'Alunos devem fazer login utilizando a matrícula escolar, não o e-mail.';
    }
    if (!ehAluno && !id.includes('@')) {
      return 'Professores e Administradores devem fazer login utilizando o e-mail institucional.';
    }
    if (!senha.trim()) return 'A senha é obrigatória.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSucesso(null);
    const erroValidacao = validar();
    setErro(erroValidacao);
    if (erroValidacao) return;

    setCarregando(true);
    try {
      setSucesso(await autenticar({ identificador: identificador.trim(), senha, perfil }));
      setSenha('');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AuthLayout
      titulo="Bem-vindo!"
      subtitulo={
        <>
          Acesse sua conta e continue
          <br />
          sua jornada de aprendizado.
        </>
      }
    >
      <form className="form" onSubmit={handleSubmit} noValidate>
        <header className="form__cabecalho">
          <h2>Entrar</h2>
          <p>Acesse sua conta para continuar</p>
        </header>

        {estado.mensagem && !erro && !sucesso && <div className="alerta alerta--sucesso">{estado.mensagem}</div>}
        {sucesso && (
          <div className="alerta alerta--sucesso" role="status">
            {sucesso.mensagem} Olá, {sucesso.nome} ({PERFIS.find((p) => p.valor === sucesso.perfil)?.rotulo ?? sucesso.perfil}).
          </div>
        )}
        {erro && (
          <div className="alerta alerta--erro" role="alert">
            {erro}
          </div>
        )}

        <fieldset className="campo">
          <legend className="rotulo">Sou:</legend>
          <div className="perfis" role="radiogroup">
            {PERFIS.map(({ valor, rotulo, icone }) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={perfil === valor}
                className={`perfil ${perfil === valor ? 'perfil--ativo' : ''}`}
                onClick={() => trocarPerfil(valor)}
              >
                <span aria-hidden="true">{icone}</span> {rotulo}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="campo">
          <label className="rotulo" htmlFor="identificador">
            {ehAluno ? 'Matrícula' : 'Email'}
          </label>
          <input
            id="identificador"
            className="input"
            type={ehAluno ? 'text' : 'email'}
            autoComplete="username"
            placeholder={ehAluno ? 'Ex: 2024001234' : 'seu.email@escola.edu.br'}
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
          />
        </div>

        <div className="campo">
          <label className="rotulo" htmlFor="senha">
            Senha
          </label>
          <CampoSenha
            id="senha"
            autoComplete="current-password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit" className="botao botao--primario" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        {/* O back-end só possui cadastro de aluno */}
        {ehAluno && (
          <p className="form__rodape">
            Primeiro acesso? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
