import type { ReactNode } from 'react';
import { PainelLayout, type ItemMenu } from '../../components/PainelLayout';

const MENU_GESTOR: ItemMenu[] = [
  { icone: '📊', rotulo: 'Visão Geral', rota: '/gestor', exato: true },
  { icone: '📚', rotulo: 'Livros', rota: '/gestor/livros' },
  { icone: '🔍', rotulo: 'Acervo Digital', rota: '/acervo' },
  { icone: '📋', rotulo: 'Empréstimos' },
  { icone: '📝', rotulo: 'Relatórios' },
];

interface GestorLayoutProps {
  titulo: string;
  acoes?: ReactNode;
  children: ReactNode;
}

//O Gestor (servidor da escola) cuida do acervo: cadastra, edita e exclui materiais
export function GestorLayout({ titulo, acoes, children }: GestorLayoutProps) {
  return (
    <PainelLayout area="Gestão do Acervo" descricaoUsuario="Gestor" menu={MENU_GESTOR} titulo={titulo} acoes={acoes}>
      {children}
    </PainelLayout>
  );
}
