import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RotaProtegida } from './components/RotaProtegida';
import { Acervo } from './pages/acervo/Acervo';
import { DetalhesMaterial } from './pages/acervo/DetalhesMaterial';
import { CadastroAluno } from './pages/admin/CadastroAluno';
import { CadastroLivro } from './pages/admin/CadastroLivro';
import { CadastroProfessor } from './pages/admin/CadastroProfessor';
import { Dashboard } from './pages/admin/Dashboard';
import { EditarAluno } from './pages/admin/EditarAluno';
import { EditarProfessor } from './pages/admin/EditarProfessor';
import { ListaAlunos } from './pages/admin/ListaAlunos';
import { ListaProfessores } from './pages/admin/ListaProfessores';
import { AreaAluno } from './pages/aluno/AreaAluno';
import { LoginAdministrador } from './pages/LoginAdministrador';
import { LoginAluno } from './pages/LoginAluno';
import { LoginProfessor } from './pages/LoginProfessor';
import { PaginaInicial } from './pages/PaginaInicial';
import { PainelProfessor } from './pages/professor/PainelProfessor';
import { RecuperarSenha } from './pages/RecuperarSenha';
import { RedefinirSenha } from './pages/RedefinirSenha';

const admin = (pagina: ReactNode) => <RotaProtegida perfil="ADMINISTRADOR">{pagina}</RotaProtegida>;

//O cadastro de usuários é feito apenas pelo Administrador, por isso não há rota pública de cadastro
export function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaInicial />} />
      <Route path="/login" element={<LoginAluno />} />
      <Route path="/login/professor" element={<LoginProfessor />} />
      <Route path="/login/administrador" element={<LoginAdministrador />} />
      <Route path="/esqueci-senha" element={<RecuperarSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />

      <Route path="/acervo" element={<RotaProtegida><Acervo /></RotaProtegida>} />
      <Route path="/acervo/:id" element={<RotaProtegida><DetalhesMaterial /></RotaProtegida>} />
      <Route path="/aluno" element={<RotaProtegida perfil="ALUNO"><AreaAluno /></RotaProtegida>} />
      <Route path="/professor" element={<RotaProtegida perfil="PROFESSOR"><PainelProfessor /></RotaProtegida>} />

      <Route path="/admin" element={admin(<Dashboard />)} />
      {/* A listagem de livros (wireframe 20) ainda não existe: o menu leva direto ao cadastro */}
      <Route path="/admin/livros" element={<Navigate to="/admin/livros/novo" replace />} />
      <Route path="/admin/livros/novo" element={admin(<CadastroLivro />)} />
      <Route path="/admin/alunos" element={admin(<ListaAlunos />)} />
      <Route path="/admin/alunos/novo" element={admin(<CadastroAluno />)} />
      <Route path="/admin/alunos/:id" element={admin(<EditarAluno />)} />
      <Route path="/admin/professores" element={admin(<ListaProfessores />)} />
      <Route path="/admin/professores/novo" element={admin(<CadastroProfessor />)} />
      <Route path="/admin/professores/:id" element={admin(<EditarProfessor />)} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
