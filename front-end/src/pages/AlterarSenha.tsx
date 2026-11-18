import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { alterarSenha } from '../api/auth';
import { ApiError } from '../api/http';
import { obterSessao } from '../api/sessao';
import { CampoSenha } from '../components/CampoSenha';
import { ForcaSenha, RequisitosSenha } from '../components/ForcaSenha';
import { destinoDoPerfil } from '../components/LoginForm';
import { TopoUsuario } from '../components/TopoUsuario';
import { REGRA_SENHA, senhaForte } from '../utils/senha';

//Redefinição de senha para o usuário logado (qualquer perfil): confirma a senha atual e cria uma nova.
//Quem esqueceu a senha usa o fluxo /esqueci-senha -> /redefinir-senha.
export function AlterarSenha() {
  const navigate = useNavigate();
  const sessao = obterSessao()!;
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const coincidem = confirmarNovaSenha !== '' && novaSenha === confirmarNovaSenha;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSucesso(null);
    if (!senhaAtual) return setErro('Informe a sua senha atual.');
    if (!novaSenha) return setErro('A nova senha é obrigatória.');
    if (!senhaForte(novaSenha)) return setErro(REGRA_SENHA);
    if (novaSenha === senhaAtual) return setErro('A nova senha deve ser diferente da senha atual.');
    if (novaSenha !== confirmarNovaSenha) return setErro('A nova senha e a confirmação de senha não coincidem.');

    setErro(null);
    setCarregando(true);
    try {
      const resposta = await alterarSenha({ senhaAtual, novaSenha, confirmarNovaSenha });
      setSucesso(resposta.mensagem);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="inicio">
      <TopoUsuario />

      <main className="acervo">
        <nav className="trilha" aria-label="Você está em">
          <Link to={destinoDoPerfil(sessao.perfil)}>Meu painel</Link> › <span aria-current="page">Alterar Senha</span>
        </nav>

        <div className="acervo__titulo">
          <div>
            <h1>Alterar Senha</h1>
            <p>Defina uma nova senha de acesso para {sessao.email}</p>
          </div>
        </div>

        <div className="alterar-senha">
          <form className="cartao formulario" onSubmit={handleSubmit} noValidate>
            {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}
            {sucesso && <div className="alerta alerta--sucesso" role="status">{sucesso}</div>}

            <div className="campo">
              <label className="rotulo" htmlFor="senhaAtual">Senha atual *</label>
              <CampoSenha id="senhaAtual" className="input" autoComplete="current-password" placeholder="Digite sua senha atual"
                value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
              <small className="dica">
                Esqueceu a senha atual? <Link to="/esqueci-senha" state={{ voltarPara: '/alterar-senha' }}>Recuperar por e-mail</Link>
              </small>
            </div>

            <div className="campo">
              <label className="rotulo" htmlFor="novaSenha">Nova senha *</label>
              <CampoSenha id="novaSenha" className="input" autoComplete="new-password" placeholder="Digite a nova senha"
                value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
              <ForcaSenha senha={novaSenha} />
            </div>

            <div className="campo">
              <label className="rotulo" htmlFor="confirmarNovaSenha">Confirmar nova senha *</label>
              <CampoSenha id="confirmarNovaSenha" className="input" autoComplete="new-password" placeholder="Repita a nova senha"
                value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} />
              {confirmarNovaSenha && (
                <span className="forca__texto" style={{ color: coincidem ? 'var(--verde)' : 'var(--vermelho)' }}>
                  {coincidem ? '✓ As senhas coincidem' : '✕ As senhas não coincidem'}
                </span>
              )}
            </div>

            <div className="formulario__acoes">
              <button type="button" className="botao botao--secundario" onClick={() => navigate(destinoDoPerfil(sessao.perfil))} disabled={carregando}>
                Cancelar
              </button>
              <button type="submit" className="botao botao--verde" disabled={carregando}>
                {carregando ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </div>
          </form>

          <aside className="cartao">
            <h2 className="cartao__titulo">💡 Requisitos da Senha</h2>
            <RequisitosSenha senha={novaSenha} />
          </aside>
        </div>
      </main>
    </div>
  );
}
