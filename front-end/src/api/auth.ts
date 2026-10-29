import type {
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
