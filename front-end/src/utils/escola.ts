export const SERIES = [
  '6º Ano - Fundamental',
  '7º Ano - Fundamental',
  '8º Ano - Fundamental',
  '9º Ano - Fundamental',
  '1ª Série - Médio',
  '2ª Série - Médio',
  '3ª Série - Médio',
];

export const TURMAS = ['Turma A', 'Turma B', 'Turma C', 'Turma D', 'Turma E'];

export const TURNOS = ['Manhã', 'Tarde', 'Noite'];

export const DISCIPLINAS = [
  'Português',
  'Matemática',
  'História',
  'Geografia',
  'Ciências',
  'Inglês',
  'Artes',
  'Educação Física',
  'Física',
  'Química',
  'Biologia',
];

export const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

//Garante que o valor já salvo apareça no <select> mesmo que não esteja na lista padrão
export const opcoesCom = (lista: string[], atual: string) => (atual && !lista.includes(atual) ? [atual, ...lista] : lista);

//"9º Ano - Fundamental" + "Turma A" => "9º Ano A"
export function serieTurmaCurta(serie: string, turma: string): string {
  return `${serie.split(' - ')[0]} ${turma.replace(/^Turma\s+/i, '')}`.trim();
}

//Valores distintos de uma lista, em ordem alfabética
export const distintos = (valores: string[]) => [...new Set(valores.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
