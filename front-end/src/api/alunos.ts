import type {
  Aluno,
  AlunoAtualizacaoRequest,
  AlunoCadastroRequest,
  AlunoCadastroResponse,
  MensagemResponse,
} from '../types/api';
import { del, get, post, put } from './http';

export function cadastrarAluno(dados: AlunoCadastroRequest): Promise<AlunoCadastroResponse> {
  return post<AlunoCadastroResponse>('/alunos', dados);
}

export function listarAlunos(nome?: string): Promise<Aluno[]> {
  const filtro = nome?.trim() ? `?nome=${encodeURIComponent(nome.trim())}` : '';
  return get<Aluno[]>(`/alunos${filtro}`);
}

export function buscarAluno(id: number): Promise<Aluno> {
  return get<Aluno>(`/alunos/${id}`);
}

export function atualizarAluno(id: number, dados: AlunoAtualizacaoRequest): Promise<Aluno> {
  return put<Aluno>(`/alunos/${id}`, dados);
}

export function excluirAluno(id: number): Promise<MensagemResponse> {
  return del<MensagemResponse>(`/alunos/${id}`);
}
