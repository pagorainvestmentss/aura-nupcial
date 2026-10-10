import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole } from '../types/wedding';
import { AdminLoginPage } from '../routes/admin/AdminLoginPage';

interface RequireAuthProps {
  role: UserRole;
  children: React.ReactNode;
}

/**
 * Guard de rota — espelho frontend das políticas que, em produção,
 * serão forçadas no backend (Supabase RLS). Nunca confiar só neste ficheiro.
 *
 *  - ADMIN   sem sessão  → mostra o login de admin ALI em /admin
 *  - CLIENTE sem sessão  → redirect para /login
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ role, children }) => {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    if (role === 'admin') {
      return <AdminLoginPage />;
    }
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (session.role !== role) {
    // Sessão válida mas do ambiente errado → devolver ao ambiente próprio.
    return <Navigate to={session.role === 'admin' ? '/admin' : '/cliente'} replace />;
  }

  return <>{children}</>;
};
