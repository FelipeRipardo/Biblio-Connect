import type { CategoriaMaterial, Material, Perfil, TipoMaterial, Visibilidade } from '../types/api';

//Rótulos dos enums do back-end (domain.enums.CategoriaMaterial e TipoMaterial)
export const CATEGORIAS: { valor: CategoriaMaterial; rotulo: string; icone: string }[] = [
  { valor: 'DIDATICO', rotulo: 'Didático', icone: '📖' },
  { valor: 'COMPLEMENTAR', rotulo: 'Paradidático', icone: '📚' }, //"Paradidático" do wireframe 05
  { valor: 'LITERATURA', rotulo: 'Literário', icone: '📕' },
  { valor: 'CIENTIFICO', rotulo: 'Científico', icone: '🔬' },
  { valor: 'PERIODICO', rotulo: 'Periódico', icone: '📰' },
  { valor: 'TECNICO', rotulo: 'Técnico', icone: '🛠️' },
];

export const TIPOS_MATERIAL: { valor: TipoMaterial; rotulo: string }[] = [
  { valor: 'LIVRO', rotulo: 'Livro' },
  { valor: 'APOSTILA', rotulo: 'Apostila' },
  { valor: 'ARTIGO', rotulo: 'Artigo' },
  { valor: 'REVISTA', rotulo: 'Revista' },
  { valor: 'MANUAL', rotulo: 'Manual' },
];

//Acesso ao material (Material.visibilidade)
export const VISIBILIDADES: { valor: Visibilidade; rotulo: string; icone: string; descricao: string; etiqueta: string }[] = [
  {
    valor: 'PUBLICO',
    rotulo: 'Público',
    icone: '🌐',
    descricao: 'O aluno lê na biblioteca e também pode baixar o arquivo.',
    etiqueta: 'etiqueta--verde',
  },
  {
    valor: 'INTERNO',
    rotulo: 'Interno',
    icone: '🔒',
    descricao: 'Leitura somente dentro da biblioteca, sem opção de download.',
    etiqueta: 'etiqueta--amarela',
  },
];

export const infoVisibilidade = (visibilidade: Visibilidade | null | undefined) =>
  VISIBILIDADES.find((v) => v.valor === visibilidade) ?? VISIBILIDADES[1]; //Sem informação, trata como interno (mais restritivo)

//Só materiais públicos com arquivo válido podem ser baixados
export const podeBaixar = (material: Pick<Material, 'visibilidade' | 'urlArquivo'>) =>
  material.visibilidade === 'PUBLICO' && !!urlSegura(material.urlArquivo);

//Leitor interno da biblioteca
export const rotaLeitura = (id: number) => `/acervo/${id}/ler`;

export const rotuloCategoria = (categoria: CategoriaMaterial) =>
  CATEGORIAS.find((c) => c.valor === categoria)?.rotulo ?? categoria;

export const rotuloTipo = (tipo: TipoMaterial) => TIPOS_MATERIAL.find((t) => t.valor === tipo)?.rotulo ?? tipo;

//Cor e ícone das capas geradas para cada disciplina (wireframe 06)
const VISUAL_DISCIPLINA: Record<string, { cor: string; icone: string }> = {
  Matemática: { cor: '#e74c3c', icone: '📐' },
  Português: { cor: '#3498db', icone: '📝' },
  Ciências: { cor: '#27ae60', icone: '🔬' },
  História: { cor: '#f39c12', icone: '🏛️' },
  Geografia: { cor: '#9b59b6', icone: '🌍' },
  Inglês: { cor: '#1abc9c', icone: '🔤' }, //Bandeiras viram letras ("GB") no Windows
  Artes: { cor: '#e91e63', icone: '🎨' },
  'Educação Física': { cor: '#607d8b', icone: '⚽' },
  Física: { cor: '#2d5a87', icone: '⚛️' },
  Química: { cor: '#8e44ad', icone: '🧪' },
  Biologia: { cor: '#16a085', icone: '🧬' },
};

export const visualDisciplina = (disciplina: string) =>
  VISUAL_DISCIPLINA[disciplina] ?? { cor: 'var(--azul-escuro)', icone: '📚' };

//Os links vêm de texto digitado no cadastro: só http(s) pode virar href/src
export const urlSegura = (url: string | null | undefined) => (url && /^https?:\/\/\S+$/i.test(url.trim()) ? url.trim() : null);

//"9º Ano - Fundamental" => "9º Ano"
export const serieCurta = (serie: string) => serie.split(' - ')[0];

//"9º Ano - Fundamental" => "Ensino Fundamental"
export function nivelDaSerie(serie: string): string | null {
  const nivel = serie.split(' - ')[1];
  return nivel ? `Ensino ${nivel}` : null;
}

//Perfis que podem cadastrar, editar e excluir materiais (POST/PUT/DELETE de /api/materiais)
export const podeGerenciarAcervo = (perfil: Perfil | undefined) => perfil === 'ADMINISTRADOR' || perfil === 'GESTOR';

//Base das telas de gestão do acervo de cada perfil: /admin/livros ou /gestor/livros
export const rotaGestaoAcervo = (perfil: Perfil | undefined) => (perfil === 'GESTOR' ? '/gestor/livros' : '/admin/livros');
