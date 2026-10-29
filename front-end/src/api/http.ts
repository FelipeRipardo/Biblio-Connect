export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const MENSAGEM_SEM_CONEXAO =
  'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.';

//Usada quando o back-end não devolve { "erro": "..." } (ex.: ResponseStatusException do PermissaoService)
function mensagemPadrao(status: number): string {
  if (status >= 500) return MENSAGEM_SEM_CONEXAO;
  if (status === 400) return 'Dados inválidos. Revise os campos e tente novamente.';
  if (status === 401) return 'Sua sessão não é válida. Faça login novamente.';
  if (status === 403) return 'Acesso negado: seu perfil não tem permissão para esta operação.';
  if (status === 404) return 'Registro não encontrado.';
  return `Erro inesperado (código ${status}).`;
}

interface Opcoes {
  corpo?: unknown;
  headers?: Record<string, string>;
}

async function requisicao<T>(metodo: string, caminho: string, { corpo, headers }: Opcoes = {}): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: { ...(corpo !== undefined && { 'Content-Type': 'application/json' }), ...headers },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError(MENSAGEM_SEM_CONEXAO, 0);
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    //Os controllers devolvem erros de regra de negócio no formato { "erro": "..." }
    const erro = dados && typeof dados.erro === 'string' ? dados.erro : mensagemPadrao(resposta.status);
    throw new ApiError(erro, resposta.status);
  }

  return dados as T;
}

export const get = <T>(caminho: string, opcoes?: Opcoes) => requisicao<T>('GET', caminho, opcoes);
export const post = <T>(caminho: string, corpo: unknown, opcoes?: Opcoes) =>
  requisicao<T>('POST', caminho, { ...opcoes, corpo });
export const put = <T>(caminho: string, corpo: unknown, opcoes?: Opcoes) =>
  requisicao<T>('PUT', caminho, { ...opcoes, corpo });
export const del = <T>(caminho: string, opcoes?: Opcoes) => requisicao<T>('DELETE', caminho, opcoes);

//Os endpoints de escrita exigem o id do Administrador logado no cabeçalho X-Admin-Id
export const comoAdmin = (adminId: number): Opcoes => ({ headers: { 'X-Admin-Id': String(adminId) } });
