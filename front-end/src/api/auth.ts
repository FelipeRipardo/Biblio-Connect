import type {
  AlterarSenhaRequest,
  EsqueciSenhaResponse,
  LoginRequest,
  LoginResponse,
  MensagemResponse,
  RedefinirSenhaRequest,
} from '../types/api';
import { post } from './http';

export function autenticar(dados: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', dados);
}

export function solicitarRecuperacaoSenha(identificador: string): Promise<EsqueciSenhaResponse> {
  return post<EsqueciSenhaResponse>('/auth/esqueci-senha', { identificador });
}

export function redefinirSenha(dados: RedefinirSenhaRequest): Promise<MensagemResponse> {
  return post<MensagemResponse>('/auth/redefinir-senha', dados);
}

//Troca de senha do usuário logado (qualquer perfil), confirmando a senha atual
export function alterarSenha(dados: AlterarSenhaRequest): Promise<MensagemResponse> {
  return post<MensagemResponse>('/auth/alterar-senha', dados);
}
