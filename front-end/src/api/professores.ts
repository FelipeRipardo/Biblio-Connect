import type {
  MensagemResponse,
  Professor,
  ProfessorAtualizacaoRequest,
  ProfessorCadastroRequest,
  ProfessorCadastroResponse,
} from '../types/api';
import { comoAdmin, del, get, post, put } from './http';

export function cadastrarProfessor(adminId: number, dados: ProfessorCadastroRequest): Promise<ProfessorCadastroResponse> {
  return post<ProfessorCadastroResponse>('/professores/cadastro', dados, comoAdmin(adminId));
}

export function listarProfessores(nome?: string): Promise<Professor[]> {
  const filtro = nome?.trim() ? `?nome=${encodeURIComponent(nome.trim())}` : '';
  return get<Professor[]>(`/professores${filtro}`);
}

export function buscarProfessor(id: number): Promise<Professor> {
  return get<Professor>(`/professores/${id}`);
}

export function atualizarProfessor(adminId: number, id: number, dados: ProfessorAtualizacaoRequest): Promise<Professor> {
  return put<Professor>(`/professores/${id}`, dados, comoAdmin(adminId));
}

export function excluirProfessor(adminId: number, id: number): Promise<MensagemResponse> {
  return del<MensagemResponse>(`/professores/${id}`, comoAdmin(adminId));
}
