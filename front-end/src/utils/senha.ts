//Mesma regra do SenhaValidator: mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial
const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-])[A-Za-z\d@$!%*?&#._-]{8,}$/;

export const REQUISITOS_SENHA = [
  { rotulo: 'Mínimo 8 caracteres', atende: (s: string) => s.length >= 8 },
  { rotulo: 'Letra maiúscula', atende: (s: string) => /[A-Z]/.test(s) },
  { rotulo: 'Letra minúscula', atende: (s: string) => /[a-z]/.test(s) },
  { rotulo: 'Número', atende: (s: string) => /\d/.test(s) },
  { rotulo: 'Caractere especial (@ $ ! % * ? & # . _ -)', atende: (s: string) => /[@$!%*?&#._-]/.test(s) },
];

export const REGRA_SENHA =
  'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial (@ $ ! % * ? & # . _ -).';

export function senhaForte(senha: string): boolean {
  return SENHA_FORTE.test(senha);
}

//Quantidade de requisitos atendidos, usada nos indicadores de força
export function pontosSenha(senha: string): number {
  return REQUISITOS_SENHA.filter((r) => r.atende(senha)).length;
}
