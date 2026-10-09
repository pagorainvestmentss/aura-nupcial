import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthSession, OccasionId, PlanId } from '../types/wedding';
import { WeddingStorageService } from '../services/weddingStorage';
import { createAccount } from '../services/onboarding';

const SESSION_KEY = 'aura_session_v1';

/**
 * Contas de administrador da plataforma.
 * Produção: credenciais vêm do ambiente (VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD).
 * Desenvolvimento: conta de cortesia local — NUNCA chega ao bundle de produção.
 * Em produção com Supabase Auth (Fase 2) este mecanismo é substituído.
 */
export interface AdminAccount {
  email: string;
  password: string;
  displayName: string;
}

const DEV_ADMIN: AdminAccount = {
  email: 'admin@auranupcial.com',
  password: 'admin123',
  displayName: 'Administração Aura Nupcial'
};

export function getAdminAccounts(
  env: { DEV?: boolean; VITE_ADMIN_EMAIL?: string; VITE_ADMIN_PASSWORD?: string } = import.meta.env
): AdminAccount[] {
  if (env.VITE_ADMIN_EMAIL && env.VITE_ADMIN_PASSWORD) {
    return [
      { email: env.VITE_ADMIN_EMAIL, password: env.VITE_ADMIN_PASSWORD, displayName: 'Administração Aura Nupcial' }
    ];
  }
  // `import.meta.env.DEV` é substituído estaticamente no build de produção,
  // pelo que o ramo abaixo (e as credenciais de cortesia) é eliminado do bundle.
  if (import.meta.env.DEV && env.DEV !== false) {
    return [DEV_ADMIN];
  }
  return [];
}

interface AuthContextValue {
  session: AuthSession | null;
  login: (email: string, password?: string) => { ok: boolean; error?: string };
  register: (params: {
    name: string;
    email: string;
    whatsapp: string;
    occasion: OccasionId;
    plan?: PlanId;
  }) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());

  useEffect(() => {
    WeddingStorageService.init();
  }, []);

  const login = useCallback((email: string, password?: string): { ok: boolean; error?: string } => {
    const normalized = email.trim().toLowerCase();

    const admin = getAdminAccounts().find((a) => a.email === normalized);
    if (admin) {
      if (admin.password !== password) return { ok: false, error: 'Palavra-passe incorreta.' };
      const next: AuthSession = {
        role: 'admin',
        email: admin.email,
        displayName: admin.displayName
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
      return { ok: true };
    }

    // Cliente: login apenas por email (sem palavra-passe).
    const couple = WeddingStorageService.getCouples().find(
      (c) => c.email.trim().toLowerCase() === normalized
    );
    if (couple) {
      if (couple.status === 'suspended') {
        return { ok: false, error: 'Esta conta encontra-se suspensa. Contacte a plataforma.' };
      }
      const next: AuthSession = {
        role: 'cliente',
        email: couple.email,
        displayName: couple.name,
        coupleId: couple.id
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
      return { ok: true };
    }

    return { ok: false, error: 'Conta não encontrada. Verifique o email ou crie uma conta.' };
  }, []);

  const register = useCallback(
    (params: {
      name: string;
      email: string;
      whatsapp: string;
      occasion: OccasionId;
      plan?: PlanId;
    }): { ok: boolean; error?: string } => {
      const result = createAccount(params);
      if (!result.ok || !result.couple) return { ok: false, error: result.error || 'Não foi possível criar a conta.' };

      const next: AuthSession = {
        role: 'cliente',
        email: result.couple.email,
        displayName: result.couple.name,
        coupleId: result.couple.id
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const value = useMemo(() => ({ session, login, register, logout }), [session, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
