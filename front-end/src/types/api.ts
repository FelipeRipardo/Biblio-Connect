//Tipos espelhados dos DTOs do back-end (com.biblioconnect.api.dto / domain.enums)

export type Perfil = 'ALUNO' | 'PROFESSOR' | 'GESTOR' | 'ADMINISTRADOR';

//LoginRequestDTO
export interface LoginRequest {
  identificador: string; //Matrícula (Aluno) ou e-mail (demais perfis)
  senha: string;
  perfil: Perfil;
}

//LoginResponseDTO
export interface LoginResponse {
  mensagem: string;
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
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
  senha: string;
  confirmarSenha: string;
  termosAceitos: boolean;
}

//Resposta de POST /api/alunos/cadastro
export interface AlunoCadastroResponse {
  mensagem: string;
  id: number;
  nome: string;
  email: string;
}
