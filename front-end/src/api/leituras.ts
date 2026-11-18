import type { Leitura, LeituraProgressoRequest } from '../types/api';
import { get, post, put } from './http';

//Histórico de leituras do usuário logado, da mais recente para a mais antiga
export function listarLeituras(): Promise<Leitura[]> {
  return get<Leitura[]>('/leituras');
}

//Abre um material no leitor: cria a leitura se for a primeira vez ou devolve a existente
//(com a página onde o usuário parou) e atualiza o último acesso
export function iniciarOuContinuarLeitura(materialId: number): Promise<Leitura> {
  return post<Leitura>('/leituras', { materialId });
}

export function salvarProgresso(id: number, dados: LeituraProgressoRequest): Promise<Leitura> {
  return put<Leitura>(`/leituras/${id}`, dados);
}
