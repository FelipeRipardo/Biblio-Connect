import { post } from './http';

//POST /api/historico/{materialId}: registra que o usuário logado (identificado pelo JWT) abriu o material.
//Uma falha no registro não deve impedir a leitura, por isso o erro é ignorado.
export function registrarAcesso(materialId: number) {
  post<unknown>(`/historico/${materialId}`, undefined).catch(() => undefined);
}
