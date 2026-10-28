import type {
  Aluno,
  AlunoAtualizacaoRequest,
  AlunoCadastroRequest,
  AlunoCadastroResponse,
  MensagemResponse,
} from '../types/api';
import { comoAdmin, del, get, post, put } from './http';

export function cadastrarAluno(adminId: number, dados: AlunoCadastroRequest): Promise<AlunoCadastroResponse> {
  return post<AlunoCadastroResponse>('/alunos/cadastro', dados, comoAdmin(adminId));
}

export function listarAlunos(nome?: string): Promise<Aluno[]> {
  const filtro = nome?.trim() ? `?nome=${encodeURIComponent(nome.trim())}` : '';
  return get<Aluno[]>(`/alunos${filtro}`);
}

export function buscarAluno(id: number): Promise<Aluno> {
  return get<Aluno>(`/alunos/${id}`);
}

export function atualizarAluno(adminId: number, id: number, dados: AlunoAtualizacaoRequest): Promise<Aluno> {
  return put<Aluno>(`/alunos/${id}`, dados, comoAdmin(adminId));
}

export function excluirAluno(adminId: number, id: number): Promise<MensagemResponse> {
  return del<MensagemResponse>(`/alunos/${id}`, comoAdmin(adminId));
}
