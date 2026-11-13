//Tipos espelhados dos DTOs do back-end (com.biblioconnect.api.dto / domain.enums)

export type Perfil = 'ALUNO' | 'PROFESSOR' | 'GESTOR' | 'ADMINISTRADOR';

//LoginRequestDTO
export interface LoginRequest {
  identificador: string; //Matrícula (Aluno) ou e-mail (demais perfis)
  senha: string;
  perfil: Perfil;
}

//Resposta de POST /api/auth/login
export interface LoginResponse {
  mensagem: string;
  token: string; //JWT enviado no cabeçalho Authorization das demais requisições
  tipo: 'Bearer';
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

//Usuário guardado na sessão do navegador após o login
export type UsuarioLogado = Omit<LoginResponse, 'mensagem' | 'tipo'>;

//Resposta de POST /api/auth/esqueci-senha
export interface EsqueciSenhaResponse {
  mensagem: string;
  emailDestino: string;
  tokenGeradoParaTeste: string; //O back-end ainda simula o envio do e-mail e devolve o token
  validoAte: string;
}

//RedefinirSenhaDTO
export interface RedefinirSenhaRequest {
  token: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

export interface MensagemResponse {
  mensagem: string;
}

//AlunoCadastroDTO
export interface AlunoCadastroRequest {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string; //Formato ISO (yyyy-MM-dd), convertido para LocalDate no back-end
  telefoneResponsavel: string;
  matricula: string;
  serie: string;
  turma: string;
  turno: string;
  senha: string; //Senha inicial definida pelo Administrador
}

//AlunoAtualizacaoDTO (CPF e matrícula não podem ser alterados)
export type AlunoAtualizacaoRequest = Omit<AlunoCadastroRequest, 'cpf' | 'matricula' | 'senha'>;

//Resposta de POST /api/alunos
export interface AlunoCadastroResponse {
  mensagem: string;
  id: number;
  nome: string;
  matricula: string;
}

//AlunoResponseDTO
export interface Aluno {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  cpf: string;
  dataNascimento: string;
  telefoneResponsavel: string;
  matricula: string;
  serie: string;
  turma: string;
  turno: string;
}

//ProfessorCadastroDTO
export interface ProfessorCadastroRequest {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  registroFuncional: string;
  disciplinas: string[];
  turmas: string[];
  senha: string; //Senha inicial definida pelo Administrador
  comprovanteVinculo?: string;
}

//ProfessorAtualizacaoDTO (CPF e registro funcional não podem ser alterados)
export type ProfessorAtualizacaoRequest = Omit<ProfessorCadastroRequest, 'cpf' | 'registroFuncional' | 'senha'>;

//Resposta de POST /api/professores
export interface ProfessorCadastroResponse {
  mensagem: string;
  id: number;
  nome: string;
  email: string;
}

//domain.enums.TipoMaterial e CategoriaMaterial
export type TipoMaterial = 'LIVRO' | 'ARTIGO' | 'APOSTILA' | 'REVISTA' | 'MANUAL';
export type CategoriaMaterial = 'LITERATURA' | 'DIDATICO' | 'CIENTIFICO' | 'PERIODICO' | 'COMPLEMENTAR' | 'TECNICO';

//MaterialRequestDTO
export interface MaterialRequest {
  titulo: string;
  autor: string;
  categoria: CategoriaMaterial;
  tipoMaterial: TipoMaterial;
  ano: number;
  serie: string;
  disciplina: string;
  descricao: string;
  isbn?: string;
  editora?: string;
  urlArquivo: string; //Link do PDF/e-book: o back-end guarda só a URL, não recebe o arquivo
  capaUrl?: string;
}

//Filtros aceitos por GET /api/materiais
export interface FiltrosMaterial {
  termo?: string; //Busca no título e no autor
  categoria?: CategoriaMaterial;
  serie?: string; //Comparação exata (ignora maiúsculas)
  disciplina?: string; //Busca parcial
}

//MaterialResponseDTO
export interface Material {
  id: number;
  titulo: string;
  autor: string;
  categoria: CategoriaMaterial;
  tipoMaterial: TipoMaterial;
  ano: number | null;
  serie: string | null;
  disciplina: string | null;
  descricao: string | null;
  isbn: string | null;
  editora: string | null;
  urlArquivo: string | null;
  capaUrl: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
}

//ProfessorResponseDTO
export interface Professor {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  cpf: string;
  telefone: string;
  registroFuncional: string;
  disciplinas: string[];
  turmas: string[];
  comprovanteVinculo: string | null;
}
