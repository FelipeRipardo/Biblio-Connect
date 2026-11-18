import type { Aluno, Gestor, Material, Perfil, Professor } from '../types/api';

//Dados fictícios do modo de visualização (/preview). Só são usados em desenvolvimento.

//Favorito e leitura gravados por usuário (o back-end identifica o usuário pelo JWT)
export interface FavoritoMock {
  usuarioId: number;
  materialId: number;
  favoritadoEm: string;
}

export interface LeituraMock {
  id: number;
  usuarioId: number;
  materialId: number;
  paginaAtual: number;
  totalPaginas: number | null;
  concluida: boolean;
  iniciadaEm: string;
  ultimoAcessoEm: string;
}

export interface BancoMock {
  materiais: Material[];
  favoritos: FavoritoMock[];
  leituras: LeituraMock[];
  gestores: Gestor[];
  alunos: Aluno[];
  professores: Professor[];
  proximoId: number;
}

//Usuário que "entra" em cada perfil no modo de visualização (ids existem no banco abaixo)
export const USUARIOS_MOCK: Record<Perfil, { id: number; nome: string; email: string }> = {
  ADMINISTRADOR: { id: 1, nome: 'Ana Administradora', email: 'admin@escola.edu.br' },
  GESTOR: { id: 2, nome: 'Carlos Mendes', email: 'carlos.gestor@escola.edu.br' },
  PROFESSOR: { id: 10, nome: 'Marina Souza', email: 'marina.souza@escola.edu.br' },
  ALUNO: { id: 20, nome: 'Lucas Oliveira', email: 'lucas.oliveira@aluno.escola.edu.br' },
};

//PDF local de 12 páginas (public/mocks): sites externos costumam bloquear a exibição dentro do leitor (iframe)
const PDF = `${window.location.origin}/mocks/livro-exemplo.pdf`;

//Data no formato do LocalDateTime do back-end, alguns dias (ou horas) atrás
//Hora local, como o LocalDateTime sem fuso devolvido pelo back-end
export const diasAtrasIso = (dias: number) =>
  new Date(Date.now() - dias * 86_400_000 - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 19);

function material(
  id: number,
  dados: Pick<Material, 'titulo' | 'autor' | 'categoria' | 'tipoMaterial' | 'disciplina' | 'serie'> & Partial<Material>,
  diasAtras: number,
): Material {
  const criadoEm = diasAtrasIso(diasAtras);
  return {
    id,
    ano: 2023,
    descricao: `Material de ${dados.disciplina} para o ${dados.serie}, com teoria, exemplos resolvidos e exercícios de fixação.`,
    isbn: null,
    editora: null,
    urlArquivo: PDF,
    capaUrl: null,
    visibilidade: 'PUBLICO',
    criadoEm,
    atualizadoEm: null,
    ...dados,
  };
}

export function bancoInicial(): BancoMock {
  return {
    proximoId: 100,
    materiais: [
      material(30, { titulo: 'Matemática Compreensão 9º', autor: 'Manoel Paiva', isbn: '978-85-123', editora: 'Moderna', categoria: 'DIDATICO', tipoMaterial: 'LIVRO', disciplina: 'Matemática', serie: '9º Ano - Fundamental', ano: 2024 }, 2),
      material(31, { titulo: 'Português Linguagens 8º', autor: 'William Cereja', isbn: '978-85-456', editora: 'Saraiva', categoria: 'DIDATICO', tipoMaterial: 'LIVRO', disciplina: 'Português', serie: '8º Ano - Fundamental', ano: 2022 }, 5),
      material(32, { titulo: 'História Sociedade 7º', visibilidade: 'INTERNO', autor: 'Alfredo Boulos', isbn: '978-85-789', categoria: 'DIDATICO', tipoMaterial: 'LIVRO', disciplina: 'História', serie: '7º Ano - Fundamental' }, 9),
      material(33, { titulo: 'Ciências Naturais 6º', visibilidade: 'INTERNO', autor: 'Carlos Barros', isbn: '978-85-321', categoria: 'DIDATICO', tipoMaterial: 'LIVRO', disciplina: 'Ciências', serie: '6º Ano - Fundamental', ano: 2021 }, 12),
      material(34, { titulo: 'Geografia Geral 9º', autor: 'Eustáquio Sene', isbn: '978-85-654', categoria: 'DIDATICO', tipoMaterial: 'LIVRO', disciplina: 'Geografia', serie: '9º Ano - Fundamental' }, 15),
      material(35, { titulo: 'Way to Go English 8º', visibilidade: 'INTERNO', autor: 'Claudio Franco', isbn: '978-85-987', categoria: 'DIDATICO', tipoMaterial: 'LIVRO', disciplina: 'Inglês', serie: '8º Ano - Fundamental' }, 20),
      material(36, { titulo: 'Dom Casmurro', autor: 'Machado de Assis', categoria: 'LITERATURA', tipoMaterial: 'LIVRO', disciplina: 'Português', serie: '1ª Série - Médio', ano: 1899 }, 25),
      material(37, { titulo: 'Apostila de Física: Cinemática', autor: 'Equipe Pedagógica', categoria: 'COMPLEMENTAR', tipoMaterial: 'APOSTILA', disciplina: 'Física', serie: '1ª Série - Médio', urlArquivo: null }, 30),
      material(38, { titulo: 'Ciência Hoje das Crianças', autor: 'Instituto Ciência Hoje', categoria: 'PERIODICO', tipoMaterial: 'REVISTA', disciplina: 'Ciências', serie: '6º Ano - Fundamental' }, 34),
      material(39, { titulo: 'Química Orgânica Essencial', visibilidade: 'INTERNO', autor: 'Martha Reis', categoria: 'CIENTIFICO', tipoMaterial: 'LIVRO', disciplina: 'Química', serie: '3ª Série - Médio', ano: 2020 }, 40),
      material(40, { titulo: 'Manual do Laboratório de Biologia', visibilidade: 'INTERNO', autor: 'Coordenação de Ciências', categoria: 'TECNICO', tipoMaterial: 'MANUAL', disciplina: 'Biologia', serie: '2ª Série - Médio' }, 45),
    ],
    //Leituras e favoritos do aluno fictício (id 20) e da professora (id 10)
    favoritos: [
      { usuarioId: 20, materialId: 30, favoritadoEm: diasAtrasIso(1) },
      { usuarioId: 20, materialId: 36, favoritadoEm: diasAtrasIso(3) },
      { usuarioId: 20, materialId: 33, favoritadoEm: diasAtrasIso(6) },
      { usuarioId: 10, materialId: 30, favoritadoEm: diasAtrasIso(2) },
    ],
    leituras: [
      { id: 500, usuarioId: 20, materialId: 30, paginaAtual: 5, totalPaginas: 12, concluida: false, iniciadaEm: diasAtrasIso(6), ultimoAcessoEm: diasAtrasIso(0.1) },
      { id: 501, usuarioId: 20, materialId: 33, paginaAtual: 15, totalPaginas: null, concluida: false, iniciadaEm: diasAtrasIso(4), ultimoAcessoEm: diasAtrasIso(1.5) },
      { id: 502, usuarioId: 20, materialId: 36, paginaAtual: 12, totalPaginas: 12, concluida: true, iniciadaEm: diasAtrasIso(20), ultimoAcessoEm: diasAtrasIso(8) },
      { id: 503, usuarioId: 10, materialId: 30, paginaAtual: 9, totalPaginas: 12, concluida: false, iniciadaEm: diasAtrasIso(10), ultimoAcessoEm: diasAtrasIso(2) },
    ],
    gestores: [
      { id: 2, nome: 'Carlos Mendes', email: 'carlos.gestor@escola.edu.br', perfil: 'GESTOR' },
      { id: 3, nome: 'Beatriz Lima', email: 'beatriz.lima@escola.edu.br', perfil: 'GESTOR' },
      { id: 4, nome: 'Rafael Costa', email: 'rafael.costa@escola.edu.br', perfil: 'GESTOR' },
    ],
    professores: [
      { id: 10, nome: 'Marina Souza', email: 'marina.souza@escola.edu.br', perfil: 'PROFESSOR', cpf: '123.456.789-00', telefone: '(11) 98765-4321', registroFuncional: 'RF1001', disciplinas: ['Matemática'], turmas: ['9º A', '9º B'], comprovanteVinculo: null },
      { id: 11, nome: 'Paulo Henrique', email: 'paulo.henrique@escola.edu.br', perfil: 'PROFESSOR', cpf: '234.567.890-11', telefone: '(11) 97654-3210', registroFuncional: 'RF1002', disciplinas: ['Português', 'Inglês'], turmas: ['8º A'], comprovanteVinculo: null },
      { id: 12, nome: 'Juliana Ramos', email: 'juliana.ramos@escola.edu.br', perfil: 'PROFESSOR', cpf: '345.678.901-22', telefone: '(11) 96543-2109', registroFuncional: 'RF1003', disciplinas: ['Ciências', 'Biologia'], turmas: ['6º A', '2ª B'], comprovanteVinculo: null },
    ],
    alunos: [
      { id: 20, nome: 'Lucas Oliveira', email: 'lucas.oliveira@aluno.escola.edu.br', perfil: 'ALUNO', cpf: '456.789.012-33', dataNascimento: '2011-03-14', telefoneResponsavel: '(11) 95432-1098', matricula: '2024001234', serie: '9º Ano - Fundamental', turma: 'Turma A', turno: 'Manhã' },
      { id: 21, nome: 'Sofia Martins', email: 'sofia.martins@aluno.escola.edu.br', perfil: 'ALUNO', cpf: '567.890.123-44', dataNascimento: '2012-07-02', telefoneResponsavel: '(11) 94321-0987', matricula: '2024001235', serie: '8º Ano - Fundamental', turma: 'Turma B', turno: 'Tarde' },
      { id: 22, nome: 'Gabriel Santos', email: 'gabriel.santos@aluno.escola.edu.br', perfil: 'ALUNO', cpf: '678.901.234-55', dataNascimento: '2009-11-21', telefoneResponsavel: '(11) 93210-9876', matricula: '2024001236', serie: '1ª Série - Médio', turma: 'Turma A', turno: 'Manhã' },
    ],
  };
}
