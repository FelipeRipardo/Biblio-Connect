import type { FiltrosMaterial, Material, MaterialRequest } from '../types/api';
import { get, post } from './http';

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
