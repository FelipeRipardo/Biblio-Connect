import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { solicitarRecuperacaoSenha } from '../api/auth';
import { ApiError } from '../api/http';
import { CartaoAcesso } from '../components/AcessoLayout';
import type { EsqueciSenhaResponse } from '../types/api';

//j***@escola.edu.br
function mascararEmail(email: string): string {
  const [usuario, dominio] = email.split('@');
  return dominio ? `${usuario[0]}***@${dominio}` : email;
}

//Wireframe 31: solicita o link de recuperação (POST /auth/esqueci-senha)
export function RecuperarSenha() {
  const voltarPara = (useLocation().state as { voltarPara?: string } | null)?.voltarPara ?? '/login';

  const [identificador, setIdentificador] = useState('');
  const [resposta, setResposta] = useState<EsqueciSenhaResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e?: FormEvent) {
    e?.preventDefault();
    if (!identificador.trim()) {
      setErro('Informe o seu e-mail institucional ou matrícula escolar.');
      return;
    }
    setErro(null);
    setCarregando(true);
    try {
      setResposta(await solicitarRecuperacaoSenha(identificador.trim()));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  const voltar = (
    <Link className="cartao-acesso__voltar" to={voltarPara}>
      ← Voltar para o Login
    </Link>
  );

  if (resposta) {
    //O back-end ainda simula o envio do e-mail e devolve o token na resposta; por isso o link é exibido aqui
    const linkRedefinicao = `/redefinir-senha?token=${encodeURIComponent(resposta.tokenGeradoParaTeste)}`;
    return (
      <CartaoAcesso icone="✓" corIcone="#d4edda">
        <h1 className="cartao-acesso__titulo cartao-acesso__titulo--verde">Email Enviado!</h1>
        <p className="cartao-acesso__texto">Enviamos um link de recuperação para:</p>
        <strong className="cartao-acesso__destaque">{mascararEmail(resposta.emailDestino)}</strong>
        <p className="cartao-acesso__texto">O link expira em 30 minutos.</p>

        {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

        <div className="alerta alerta--info">
          Ambiente de testes: o envio de e-mail ainda é simulado.{' '}
          <Link to={linkRedefinicao} state={{ voltarPara }}>Abrir link de redefinição</Link>
        </div>

        <button type="button" className="botao botao--secundario botao--bloco" onClick={() => enviar()} disabled={carregando}>
          {carregando ? 'Reenviando...' : 'Reenviar email'}
        </button>
        {voltar}
      </CartaoAcesso>
    );
  }

  return (
    <CartaoAcesso icone="🔑" corIcone="#fff3cd">
      <h1 className="cartao-acesso__titulo">Recuperar Senha</h1>
      <p className="cartao-acesso__texto">
        Digite seu email institucional ou matrícula para receber as instruções de recuperação de senha.
      </p>

      <form className="cartao-acesso__form" onSubmit={enviar} noValidate>
        {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

        <div className="campo">
          <label className="rotulo rotulo--leve" htmlFor="identificador">Email cadastrado ou matrícula</label>
          <div className="campo-icone">
            <input
              id="identificador"
              className="input input--grande"
              autoComplete="username"
              placeholder="Digite seu email..."
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
            />
            <span aria-hidden="true">📧</span>
          </div>
        </div>

        <button type="submit" className="botao botao--verde botao--bloco" disabled={carregando}>
          {carregando ? 'Enviando...' : 'Enviar Link de Recuperação'}
        </button>
      </form>

      {voltar}
      <p className="cartao-acesso__ajuda">Não recebeu o email? Verifique sua caixa de spam.</p>
    </CartaoAcesso>
  );
}
