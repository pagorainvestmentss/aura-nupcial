import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { useAuth } from './AuthContext';
import { AuthSession } from '../types/wedding';

/**
 * RequireAuth em modo Supabase: enquanto o restore da sessão ainda não
 * terminou (`loading`), o guard NÃO pode redireccionar para /login nem mostrar
 * o login de admin — senão o utilizador com sessão válida caía no /login a
 * cada F5 (Issue #46). O `useAuth` é espiado para controlar session/loading
 * sem depender do backend.
 */
vi.mock('./AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./AuthContext')>();
  return { ...actual, useAuth: vi.fn() };
});

const useAuthMock = vi.mocked(useAuth);

function renderRota(caminho: string, opts: { session: AuthSession | null; loading: boolean }) {
  useAuthMock.mockReturnValue({
    session: opts.session,
    loading: opts.loading,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    requestPasswordReset: vi.fn(),
    setNewPassword: vi.fn()
  });

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <Outlet />,
        children: [
          {
            path: 'admin-protegido',
            element: (
              <RequireAuth role="admin">
                <span>conteudo-admin</span>
              </RequireAuth>
            )
          },
          {
            path: 'cliente-protegido',
            element: (
              <RequireAuth role="cliente">
                <span>conteudo-cliente</span>
              </RequireAuth>
            )
          },
          { path: 'login', element: <span>pagina-login</span> }
        ]
      }
    ],
    { initialEntries: [caminho] }
  );

  render(<RouterProvider router={router} />);
}

const sessaoCliente: AuthSession = {
  role: 'cliente',
  email: 'mariana.pedro@auranupcial.com',
  displayName: 'Mariana & Pedro',
  coupleId: 'couple-mariana-pedro'
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RequireAuth — aguarda o restore de sessão (loading)', () => {
  it('loading + sem sessão ainda em rota cliente → mostra esqueleto, sem redirect para /login', () => {
    renderRota('/cliente-protegido', { session: null, loading: true });
    expect(screen.queryByText('pagina-login')).not.toBeInTheDocument();
    expect(screen.queryByText('conteudo-cliente')).not.toBeInTheDocument();
    document.querySelectorAll('.skeleton').forEach((el) => expect(el).toBeInTheDocument());
    expect(document.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('loading + sem sessão ainda em rota admin → mostra esqueleto, sem login de admin', () => {
    renderRota('/admin-protegido', { session: null, loading: true });
    expect(screen.queryByText('Administração Aura Nupcial')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('loading terminado + sessão de cliente → acede ao conteúdo da área do cliente', () => {
    renderRota('/cliente-protegido', { session: sessaoCliente, loading: false });
    expect(screen.getByText('conteudo-cliente')).toBeInTheDocument();
  });

  it('loading terminado sem sessão em rota cliente → redirect para /login (comportamento esperado)', () => {
    renderRota('/cliente-protegido', { session: null, loading: false });
    expect(screen.getByText('pagina-login')).toBeInTheDocument();
  });
});
