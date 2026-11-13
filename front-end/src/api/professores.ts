import type {
  MensagemResponse,
  Professor,
  ProfessorAtualizacaoRequest,
  ProfessorCadastroRequest,
  ProfessorCadastroResponse,
} from '../types/api';
import { del, get, post, put } from './http';

export function cadastrarProfessor(dados: ProfessorCadastroRequest): Promise<ProfessorCadastroResponse> {
  return post<ProfessorCadastroResponse>('/professores', dados);
}

export function listarProfessores(nome?: string): Promise<Professor[]> {
  const filtro = nome?.trim() ? `?nome=${encodeURIComponent(nome.trim())}` : '';
  return get<Professor[]>(`/professores${filtro}`);
}

export function buscarProfessor(id: number): Promise<Professor> {
  return get<Professor>(`/professores/${id}`);
}

export function atualizarProfessor(id: number, dados: ProfessorAtualizacaoRequest): Promise<Professor> {
  return put<Professor>(`/professores/${id}`, dados);
}

export function excluirProfessor(id: number): Promise<MensagemResponse> {
  return del<MensagemResponse>(`/professores/${id}`);
}
