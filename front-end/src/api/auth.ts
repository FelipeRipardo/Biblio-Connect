import type { LoginRequest, LoginResponse } from '../types/api';
import { post } from './http';

export function autenticar(dados: LoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', dados);
}
