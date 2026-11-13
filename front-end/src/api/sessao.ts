import type { LoginResponse, UsuarioLogado } from '../types/api';

const CHAVE = 'biblioconnect.usuario';

//Guardamos o usuário e o token JWT retornados pelo login; o token vai no cabeçalho Authorization das requisições.
//"Lembrar de mim" mantém a sessão no localStorage; caso contrário ela acaba ao fechar o navegador.
export function salvarSessao({ token, id, nome, email, perfil }: LoginResponse, lembrar: boolean): UsuarioLogado {
  const usuario = { token, id, nome, email, perfil };
  encerrarSessao();
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(usuario));
  return usuario;
}

export function obterSessao(): UsuarioLogado | null {
  try {
    const salvo = sessionStorage.getItem(CHAVE) ?? localStorage.getItem(CHAVE);
    const usuario = salvo ? (JSON.parse(salvo) as UsuarioLogado) : null;
    //Sessões salvas antes da autenticação por JWT não têm token e precisam de um novo login
    return usuario?.token ? usuario : null;
  } catch {
    return null;
  }
}

export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE);
  localStorage.removeItem(CHAVE);
}
