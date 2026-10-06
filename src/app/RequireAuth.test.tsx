import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { AuthProvider } from './AuthContext';
import { AuthSession } from '../types/wedding';

const SESSION_KEY = 'aura_session_v1';

function renderRota(caminho: string, session: AuthSession | null) {
  localStorage.clear();
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        ),
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
          { path: 'login', element: <span>pagina-login</span> },
          { path: 'admin', element: <span>area-admin</span> },
          { path: 'cliente', element: <span>area-cliente</span> }
        ]
      }
    ],
    { initialEntries: [caminho] }
  );

  render(<RouterProvider router={router} />);
}

const sessaoAdmin: AuthSession = {
  role: 'admin',
  email: 'admin@auranupcial.com',
  displayName: 'Administração'
};

const sessaoCliente: AuthSession = {
  role: 'cliente',
  email: 'mariana.pedro@auranupcial.com',
  displayName: 'Mariana & Pedro',
  coupleId: 'couple-mariana-pedro'
};

describe('RequireAuth — guard por role (espelho de RLS)', () => {
  it('sem sessão → redirect para /login', () => {
    renderRota('/admin-protegido', null);
    expect(screen.getByText('pagina-login')).toBeInTheDocument();
  });

  it('sessão admin em rota admin → acede ao conteúdo', () => {
    renderRota('/admin-protegido', sessaoAdmin);
    expect(screen.getByText('conteudo-admin')).toBeInTheDocument();
  });

  it('sessão cliente em rota admin → volta ao ambiente próprio (/cliente)', () => {
    renderRota('/admin-protegido', sessaoCliente);
    expect(screen.getByText('area-cliente')).toBeInTheDocument();
  });

  it('sessão cliente em rota cliente → acede ao conteúdo', () => {
    renderRota('/cliente-protegido', sessaoCliente);
    expect(screen.getByText('conteudo-cliente')).toBeInTheDocument();
  });

  it('sessão admin em rota cliente → volta ao ambiente próprio (/admin)', () => {
    renderRota('/cliente-protegido', sessaoAdmin);
    expect(screen.getByText('area-admin')).toBeInTheDocument();
  });
});
