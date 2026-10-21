export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const MENSAGEM_SEM_CONEXAO =
  'Não foi possível conectar ao servidor. Verifique se o back-end está rodando.';

function mensagemPadrao(status: number): string {
  if (status >= 500) return MENSAGEM_SEM_CONEXAO;
  if (status === 400) return 'Dados inválidos. Revise os campos e tente novamente.';
  return `Erro inesperado (código ${status}).`;
}

export async function post<T>(caminho: string, corpo: unknown): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
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
