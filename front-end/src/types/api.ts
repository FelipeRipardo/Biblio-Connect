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
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

//Usuário guardado na sessão do navegador após o login
export type UsuarioLogado = Omit<LoginResponse, 'mensagem'>;

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

//Resposta de POST /api/alunos/cadastro
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

//Resposta de POST /api/professores/cadastro
export interface ProfessorCadastroResponse {
  mensagem: string;
  id: number;
  nome: string;
  email: string;
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
