import type { Favorito, MensagemResponse } from '../types/api';
import { del, get, post } from './http';

//Favoritos do usuário logado (o back-end identifica o usuário pelo JWT)
export function listarFavoritos(): Promise<Favorito[]> {
  return get<Favorito[]>('/favoritos');
}

export function favoritar(materialId: number): Promise<Favorito> {
  return post<Favorito>('/favoritos', { materialId });
}

export function desfavoritar(materialId: number): Promise<MensagemResponse> {
  return del<MensagemResponse>(`/favoritos/${materialId}`);
}
