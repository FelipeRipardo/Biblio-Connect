import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { redefinirSenha } from '../api/auth';
import { ApiError } from '../api/http';
import { CartaoAcesso } from '../components/AcessoLayout';
import { CampoSenha } from '../components/CampoSenha';
import { ForcaSenha, RequisitosSenha } from '../components/ForcaSenha';
import { REGRA_SENHA, senhaForte } from '../utils/senha';

//Wireframe 32: cria a nova senha a partir do token do link (POST /auth/redefinir-senha)
export function RedefinirSenha() {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const voltarPara = (useLocation().state as { voltarPara?: string } | null)?.voltarPara ?? '/login';

  const [token, setToken] = useState(parametros.get('token') ?? '');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const tokenNaUrl = parametros.has('token');
  const coincidem = confirmarNovaSenha !== '' && novaSenha === confirmarNovaSenha;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token.trim()) return setErro('O token de recuperação é obrigatório.');
    if (!novaSenha) return setErro('A nova senha é obrigatória.');
    if (!senhaForte(novaSenha)) return setErro(REGRA_SENHA);
    if (novaSenha !== confirmarNovaSenha) return setErro('A nova senha e a confirmação de senha não coincidem.');

    setErro(null);
    setCarregando(true);
    try {
      const resposta = await redefinirSenha({ token: token.trim(), novaSenha, confirmarNovaSenha });
      navigate(voltarPara, { replace: true, state: { mensagem: resposta.mensagem } });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
      setCarregando(false);
    }
  }

  return (
    <CartaoAcesso icone="🔐" corIcone="#e8f5e9">
      <h1 className="cartao-acesso__titulo">Criar Nova Senha</h1>
      <p className="cartao-acesso__texto">Digite sua nova senha para acessar o sistema</p>

      <form className="cartao-acesso__form" onSubmit={handleSubmit} noValidate>
        {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

        {/* Sem token no link, o usuário pode colar o código recebido */}
        {!tokenNaUrl && (
          <div className="campo">
            <label className="rotulo rotulo--leve" htmlFor="token">Código de recuperação *</label>
            <input id="token" className="input input--grande" value={token} onChange={(e) => setToken(e.target.value)} />
          </div>
        )}

        <div className="campo">
          <label className="rotulo rotulo--leve" htmlFor="novaSenha">Nova Senha *</label>
          <CampoSenha
            id="novaSenha"
            className="input input--grande"
            autoComplete="new-password"
            placeholder="Digite sua nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <ForcaSenha senha={novaSenha} />
        </div>

        <div className="campo">
          <label className="rotulo rotulo--leve" htmlFor="confirmarNovaSenha">Confirmar Nova Senha *</label>
          <CampoSenha
            id="confirmarNovaSenha"
            className="input input--grande"
            autoComplete="new-password"
            placeholder="Confirme sua nova senha"
            value={confirmarNovaSenha}
            onChange={(e) => setConfirmarNovaSenha(e.target.value)}
          />
          {confirmarNovaSenha && (
            <span className="forca__texto" style={{ color: coincidem ? 'var(--verde)' : 'var(--vermelho)' }}>
              {coincidem ? '✓ As senhas coincidem' : '✕ As senhas não coincidem'}
            </span>
          )}
        </div>

        <button type="submit" className="botao botao--verde botao--bloco" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Salvar Nova Senha'}
        </button>
      </form>

      <Link className="cartao-acesso__voltar" to={voltarPara}>
        ← Voltar para o Login
      </Link>

      <aside className="cartao-acesso__lateral">
        <strong>💡 Requisitos da Senha</strong>
        <RequisitosSenha senha={novaSenha} />
      </aside>
    </CartaoAcesso>
  );
}
