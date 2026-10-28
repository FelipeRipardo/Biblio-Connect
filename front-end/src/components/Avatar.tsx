const CORES = ['#27ae60', '#3498db', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c', '#8e44ad', '#e07c24'];

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (partes[0][0] + ultima).toUpperCase();
}

interface AvatarProps {
  nome: string;
  id?: number;
  tamanho?: number;
  cor?: string;
}

//Círculo com as iniciais do usuário, como nas listagens e cabeçalhos dos wireframes
export function Avatar({ nome, id = 0, tamanho = 36, cor }: AvatarProps) {
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{
        width: tamanho,
        height: tamanho,
        fontSize: tamanho * 0.36,
        background: cor ?? CORES[id % CORES.length],
      }}
    >
      {iniciais(nome)}
    </span>
  );
}
