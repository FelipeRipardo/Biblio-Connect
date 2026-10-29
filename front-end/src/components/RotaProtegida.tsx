import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { obterSessao } from '../api/sessao';
import type { Perfil } from '../types/api';
import { destinoDoPerfil, rotaLoginDoPerfil } from './LoginForm';

interface RotaProtegidaProps {
  perfil: Perfil;
  children: ReactNode;
}

//Controle apenas de navegação: quem garante a permissão de fato é o PermissaoService no back-end
export function RotaProtegida({ perfil, children }: RotaProtegidaProps) {
  const usuario = obterSessao();
  if (!usuario) return <Navigate to={rotaLoginDoPerfil(perfil)} replace />;
  if (usuario.perfil !== perfil) return <Navigate to={destinoDoPerfil(usuario.perfil)} replace />;
  return <>{children}</>;
}
