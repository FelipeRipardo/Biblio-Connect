import type { AlunoCadastroRequest, AlunoCadastroResponse } from '../types/api';
import { post } from './http';

export function cadastrarAluno(dados: AlunoCadastroRequest): Promise<AlunoCadastroResponse> {
  return post<AlunoCadastroResponse>('/alunos/cadastro', dados);
}
