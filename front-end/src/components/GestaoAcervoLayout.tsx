import type { ReactNode } from 'react';
import { obterSessao } from '../api/sessao';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { GestorLayout } from '../pages/gestor/GestorLayout';

interface GestaoAcervoLayoutProps {
  titulo: string;
  acoes?: ReactNode;
  children: ReactNode;
}

//As telas de gestão do acervo são as mesmas para Administrador e Gestor; muda só o painel em volta
export function GestaoAcervoLayout(props: GestaoAcervoLayoutProps) {
  return obterSessao()?.perfil === 'GESTOR' ? <GestorLayout {...props} /> : <AdminLayout {...props} />;
}
