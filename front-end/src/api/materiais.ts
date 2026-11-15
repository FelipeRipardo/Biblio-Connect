import type { FiltrosMaterial, Material, MaterialRequest, MensagemResponse } from '../types/api';
import { del, get, post, put } from './http';

export function listarMateriais(filtros: FiltrosMaterial = {}): Promise<Material[]> {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor?.trim()) params.set(chave, valor.trim());
  }
  const query = params.toString();
  return get<Material[]>(`/materiais${query ? `?${query}` : ''}`);
}

export function buscarMaterial(id: number): Promise<Material> {
  return get<Material>(`/materiais/${id}`);
}

export function cadastrarMaterial(dados: MaterialRequest): Promise<Material> {
  return post<Material>('/materiais', dados);
}

//PUT e DELETE de /api/materiais são restritos a GESTOR e ADMINISTRADOR (SecurityConfig)
export function atualizarMaterial(id: number, dados: MaterialRequest): Promise<Material> {
  return put<Material>(`/materiais/${id}`, dados);
}

export function excluirMaterial(id: number): Promise<MensagemResponse> {
  return del<MensagemResponse>(`/materiais/${id}`);
}
