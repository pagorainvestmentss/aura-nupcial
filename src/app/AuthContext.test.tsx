import React from 'react';
import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth, getAdminAccounts } from './AuthContext';
import { WeddingStorageService } from '../services/weddingStorage';

const SESSION_KEY = 'aura_session_v1';
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper });
}

describe('AuthContext — login', () => {
  it('admin: password correcta cria sessão admin e guarda-a no armazenamento', () => {
    const { result } = renderAuth();
    let res!: ReturnType<typeof result.current.login>;
    act(() => {
      res = result.current.login('admin@auranupcial.com', 'admin123');
    });

    expect(res.ok).toBe(true);
    expect(result.current.session?.role).toBe('admin');
    expect(result.current.session?.displayName).toBe('Administração Aura Nupcial');
    expect(localStorage.getItem(SESSION_KEY)).toContain('"role":"admin"');
  });

  it('admin: password errada é rejeitada', () => {
    const { result } = renderAuth();
    let res!: ReturnType<typeof result.current.login>;
    act(() => {
      res = result.current.login('admin@auranupcial.com', 'errada');
    });

    expect(res.ok).toBe(false);
    expect(res.error).toContain('Palavra-passe');
    expect(result.current.session).toBeNull();
  });

  it('cliente: login por email do seed cria sessão com coupleId', () => {
    const { result } = renderAuth();
    let res!: ReturnType<typeof result.current.login>;
    act(() => {
      res = result.current.login('mariana.pedro@auranupcial.com');
    });

    expect(res.ok).toBe(true);
    expect(result.current.session?.role).toBe('cliente');
    expect(result.current.session?.coupleId).toBe('couple-mariana-pedro');
  });

  it('cliente: email desconhecido é rejeitado', () => {
    const { result } = renderAuth();
    let res!: ReturnType<typeof result.current.login>;
    act(() => {
      res = result.current.login('ninguem@exemplo.com');
    });

    expect(res.ok).toBe(false);
    expect(result.current.session).toBeNull();
  });

  it('cliente: conta suspensa não entra', () => {
    WeddingStorageService.setClientStatus('couple-mariana-pedro', 'suspended');
    const { result } = renderAuth();
    let res!: ReturnType<typeof result.current.login>;
    act(() => {
      res = result.current.login('mariana.pedro@auranupcial.com');
    });

    expect(res.ok).toBe(false);
    expect(res.error).toContain('suspensa');
    expect(result.current.session).toBeNull();
  });
});

describe('AuthContext — registo', () => {
  it('registo válido cria conta, evento e sessão de cliente', () => {
    const { result } = renderAuth();
    let res!: ReturnType<typeof result.current.register>;
    act(() => {
      res = result.current.register({
        name: 'Rita & Nuno',
        email: 'rita.nuno@exemplo.com',
        whatsapp: '911 222 333',
        occasion: 'casamento'
      });
    });

    expect(res.ok).toBe(true);
    expect(result.current.session?.role).toBe('cliente');
    expect(result.current.session?.coupleId).toBeTruthy();
    expect(
      WeddingStorageService.getCouples().some((c) => c.email === 'rita.nuno@exemplo.com')
    ).toBe(true);
  });

  it('registo com plano Pro honra o plano escolhido no casal criado', () => {
    const { result } = renderAuth();
    let res!: ReturnType<typeof result.current.register>;
    act(() => {
      res = result.current.register({
        name: 'Ana & Diogo',
        email: 'ana.diogo@exemplo.com',
        whatsapp: '922 333 444',
        occasion: 'casamento',
        plan: 'pro'
      });
    });

    expect(res.ok).toBe(true);
    const casal = WeddingStorageService.getCouples().find(
      (c) => c.email === 'ana.diogo@exemplo.com'
    );
    expect(casal?.plan).toBe('pro');
    expect(casal?.paymentStatus).toBe('pending');
  });

  it('registo com email existente falha sem criar sessão', () => {
    const { result } = renderAuth();
    let res!: ReturnType<typeof result.current.register>;
    act(() => {
      res = result.current.register({
        name: 'Outro Casal',
        email: 'mariana.pedro@auranupcial.com',
        whatsapp: '911 222 333',
        occasion: 'casamento'
      });
    });

    expect(res.ok).toBe(false);
    expect(result.current.session).toBeNull();
  });
});

describe('AuthContext — sessão e logout', () => {
  it('sessão existente no armazenamento é reposta no arranque', () => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ role: 'admin', email: 'admin@auranupcial.com', displayName: 'Guardado' })
    );

    const { result } = renderAuth();
    expect(result.current.session?.role).toBe('admin');
    expect(result.current.session?.displayName).toBe('Guardado');
  });

  it('logout limpa a sessão do estado e do armazenamento', () => {
    const { result } = renderAuth();
    act(() => {
      result.current.login('admin@auranupcial.com', 'admin123');
    });
    expect(result.current.session).not.toBeNull();

    act(() => {
      result.current.logout();
    });
    expect(result.current.session).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});

describe('getAdminAccounts — credenciais nunca vazadas em produção', () => {
  it('produção sem variáveis de ambiente não tem nenhuma conta admin', () => {
    expect(getAdminAccounts({ DEV: false })).toEqual([]);
  });

  it('produção usa as credenciais do ambiente (VITE_ADMIN_*)', () => {
    const contas = getAdminAccounts({
      DEV: false,
      VITE_ADMIN_EMAIL: 'chefe@exemplo.pt',
      VITE_ADMIN_PASSWORD: 'segredo-forte'
    });
    expect(contas).toHaveLength(1);
    expect(contas[0].email).toBe('chefe@exemplo.pt');
    expect(contas[0].password).toBe('segredo-forte');
  });

  it('desenvolvimento tem conta de cortesia local', () => {
    const contas = getAdminAccounts({ DEV: true });
    expect(contas).toHaveLength(1);
    expect(contas[0].email).toBe('admin@auranupcial.com');
  });

  it('variáveis de ambiente têm prioridade sobre a conta de cortesia', () => {
    const contas = getAdminAccounts({
      DEV: true,
      VITE_ADMIN_EMAIL: 'chefe@exemplo.pt',
      VITE_ADMIN_PASSWORD: 'segredo-forte'
    });
    expect(contas).toHaveLength(1);
    expect(contas[0].email).toBe('chefe@exemplo.pt');
  });
});
