import type { ReactNode } from 'react';
import { obterSessao } from '../../api/sessao';
import { PainelLayout, type ItemMenu } from '../../components/PainelLayout';

const MENU_ADMIN: ItemMenu[] = [
  { icone: '📊', rotulo: 'Dashboard', rota: '/admin', exato: true },
  { icone: '📚', rotulo: 'Livros' },
  { icone: '👥', rotulo: 'Alunos', rota: '/admin/alunos' },
  { icone: '👨‍🏫', rotulo: 'Professores', rota: '/admin/professores' },
  { icone: '📋', rotulo: 'Empréstimos' },
  { icone: '📝', rotulo: 'Relatórios' },
  { icone: '⚙️', rotulo: 'Configurações' },
];

interface AdminLayoutProps {
  titulo: string;
  acoes?: ReactNode;
  children: ReactNode;
}

export function AdminLayout({ titulo, acoes, children }: AdminLayoutProps) {
  return (
    <PainelLayout area="Painel Administrativo" descricaoUsuario="Administrador" menu={MENU_ADMIN} titulo={titulo} acoes={acoes}>
      {children}
    </PainelLayout>
  );
}

//Id do Administrador logado, enviado no cabeçalho X-Admin-Id (a rota já é protegida por RotaProtegida)
export const idDoAdmin = () => obterSessao()!.id;
