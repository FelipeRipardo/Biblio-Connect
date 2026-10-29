const apenasDigitos = (valor: string) => valor.replace(/\D/g, '');

//000.000.000-00 (14 caracteres, mesmo tamanho da coluna cpf no banco)
export function mascaraCpf(valor: string): string {
  return apenasDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

//(00) 00000-0000 ou (00) 0000-0000, dentro do limite de 20 caracteres da coluna telefone_responsavel
export function mascaraTelefone(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 11);
  if (digitos.length <= 10) {
    return digitos.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digitos.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2');
}
