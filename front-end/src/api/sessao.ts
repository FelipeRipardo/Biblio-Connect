import type { LoginResponse, UsuarioLogado } from '../types/api';

const CHAVE = 'biblioconnect.usuario';

//O back-end ainda não emite token: guardamos o usuário retornado pelo login para usar o id nos cabeçalhos.
//"Lembrar de mim" mantém a sessão no localStorage; caso contrário ela acaba ao fechar o navegador.
export function salvarSessao({ id, nome, email, perfil }: LoginResponse, lembrar: boolean): UsuarioLogado {
  const usuario = { id, nome, email, perfil };
  encerrarSessao();
  (lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(usuario));
  return usuario;
}

export function obterSessao(): UsuarioLogado | null {
  try {
    const salvo = sessionStorage.getItem(CHAVE) ?? localStorage.getItem(CHAVE);
    return salvo ? (JSON.parse(salvo) as UsuarioLogado) : null;
  } catch {
    return null;
  }
}

export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE);
  localStorage.removeItem(CHAVE);
}
