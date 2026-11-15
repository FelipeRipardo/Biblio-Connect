import type { Gestor, GestorCadastroRequest, GestorCadastroResponse } from '../types/api';
import { get, post } from './http';

//O back-end só permite cadastrar e listar gestores (não há edição nem exclusão)
export function cadastrarGestor(dados: GestorCadastroRequest): Promise<GestorCadastroResponse> {
  return post<GestorCadastroResponse>('/gestores', dados);
}

export function listarGestores(): Promise<Gestor[]> {
  return get<Gestor[]>('/gestores');
}
