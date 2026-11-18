import type { Leitura } from '../types/api';

//Percentual lido; nulo enquanto o total de páginas não for conhecido
export function percentualLeitura({ paginaAtual, totalPaginas, concluida }: Pick<Leitura, 'paginaAtual' | 'totalPaginas' | 'concluida'>) {
  if (concluida) return 100;
  if (!totalPaginas) return null;
  return Math.min(100, Math.round((paginaAtual / totalPaginas) * 100));
}

export const situacaoLeitura = (leitura: Pick<Leitura, 'concluida'>) => (leitura.concluida ? 'Concluída' : 'Em andamento');

//"2026-11-16T10:30:00" => "16/11/2026 às 10:30"
export function dataHoraBr(iso: string) {
  const data = new Date(iso);
  return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}
