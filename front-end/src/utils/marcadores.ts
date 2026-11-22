//Posição de leitura e marcadores do leitor da biblioteca.
//O back-end ainda não guarda o marcador, então tudo fica no localStorage deste navegador,
//separado por usuário e por material. Quando existir uma rota para isso, basta trocar estas funções.

export interface Marcador {
  pagina: number;
  criadoEm: string; //ISO
}

export interface EstadoLeitura {
  ultimaPagina: number;
  totalPaginas: number | null;
  marcadores: Marcador[];
  atualizadoEm: string;
}

const chave = (usuarioId: number, materialId: number) => `biblioconnect.leitor.${usuarioId}.${materialId}`;

const vazio = (): EstadoLeitura => ({ ultimaPagina: 1, totalPaginas: null, marcadores: [], atualizadoEm: new Date().toISOString() });

export function carregarLeitura(usuarioId: number, materialId: number): EstadoLeitura {
  try {
    const salvo = localStorage.getItem(chave(usuarioId, materialId));
    if (!salvo) return vazio();
    const dados = JSON.parse(salvo) as Partial<EstadoLeitura>;
    return {
      ultimaPagina: Number.isInteger(dados.ultimaPagina) && dados.ultimaPagina! > 0 ? dados.ultimaPagina! : 1,
      totalPaginas: typeof dados.totalPaginas === 'number' ? dados.totalPaginas : null,
      marcadores: Array.isArray(dados.marcadores)
        ? dados.marcadores.filter((m) => Number.isInteger(m?.pagina) && m.pagina > 0)
        : [],
      atualizadoEm: typeof dados.atualizadoEm === 'string' ? dados.atualizadoEm : new Date().toISOString(),
    };
  } catch {
    return vazio(); //Dado corrompido: recomeça do início
  }
}

export function salvarLeitura(usuarioId: number, materialId: number, estado: Omit<EstadoLeitura, 'atualizadoEm'>) {
  try {
    const dados: EstadoLeitura = { ...estado, atualizadoEm: new Date().toISOString() };
    localStorage.setItem(chave(usuarioId, materialId), JSON.stringify(dados));
  } catch {
    //Armazenamento cheio ou bloqueado: a leitura continua, só não fica salva
  }
}
