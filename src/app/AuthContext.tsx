import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthSession, OccasionId, PlanId } from '../types/wedding';
import { WeddingStorageService } from '../services/weddingStorage';
import { createAccount } from '../services/onboarding';
import { getSupabase, isSupabaseBackend } from '../services/supabase/client';
import { getRepo } from '../services/repo';

const SESSION_KEY = 'aura_session_v1';

/**
 * Contas de administrador da plataforma.
 * MODO LOCAL (dev/testes): credenciais do ambiente ou conta de cortesia.
 * MODO SUPABASE (produção): o admin entra com email + palavra-passe reais,
 * validadas pelo Supabase Auth — este mecanismo é ignorado.
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
  if (import.meta.env.DEV && env.DEV !== false) {
    return [DEV_ADMIN];
  }
  return [];
}

interface RegisterResult {
  ok: boolean;
  error?: string;
  /** true quando o Supabase exige confirmação de email antes do primeiro login. */
  pendingConfirmation?: boolean;
}

interface AuthContextValue {
  session: AuthSession | null;
  login: (email: string, password?: string) => Promise<{ ok: boolean; error?: string }>;
  register: (params: {
    name: string;
    email: string;
    whatsapp: string;
    occasion: OccasionId;
    plan?: PlanId;
  }) => Promise<RegisterResult>;
  logout: () => void;
  /** Envia o link de redefinição por email (só no modo Supabase). */
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  /** Define a nova palavra-passe após o link de redefinição (só no modo Supabase). */
  setNewPassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// --- helpers Supabase ------------------------------------------------------

/** Telefone → palavra-passe E.164 (ex.: "923 087 941" → "+244923087941"). */
export function phoneAsPassword(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 9 && digits.startsWith('9')) digits = `244${digits}`;
  return `+${digits}`;
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes('rate limit') ||
    m.includes('over_email_send_rate_limit') ||
    m.includes('too many')
  ) {
    return 'Já pediu muitos emails recentemente. Aguarde alguns minutos e tente novamente.';
  }
  if (m.includes('invalid login') || m.includes('invalid_credentials')) {
    return 'Credenciais incorretas. Verifique o email e a palavra-passe (o seu número de WhatsApp).';
  }
  if (m.includes('email not confirmed')) return 'Confirme o email antes de entrar.';
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'Já existe uma conta com este email. Faça login.';
  }
  if (m.includes('user not found') || m.includes('user does not exist')) {
    return 'Não encontrámos nenhuma conta com este email. Contacte a plataforma.';
  }
  if (m.includes('email_address_invalid') || m.includes('not authorized')) {
    return 'Não foi possível enviar o email. Verifique o endereço ou tente mais tarde.';
  }
  if (m.includes('token has expired') || m.includes('invalid token') || m.includes('otp')) {
    return 'Este link expirou ou já foi usado. Peça um novo.';
  }
  if (m.includes('password')) {
    return 'A palavra-passe deve ter pelo menos 8 caracteres.';
  }
  return 'Não foi possível entrar. Tente novamente.';
}

/** Constrói a sessão da app a partir do utilizador autenticado + o seu perfil. */
async function buildSessionFromUser(user: { id: string; email?: string }): Promise<AuthSession | null> {
  const supabase = getSupabase();
  const { data: prof } = await supabase
    .from('profiles')
    .select('role, display_name, couple_id')
    .eq('id', user.id)
    .single();
  if (!prof) return null;

  if (prof.role === 'admin') {
    return { role: 'admin', email: user.email ?? '', displayName: prof.display_name || 'Administração Aura Nupcial' };
  }

  const coupleId = prof.couple_id as string | null;
  if (!coupleId) return null;

  const couple = await getRepo().getCoupleById(coupleId);
  return {
    role: 'cliente',
    email: user.email ?? '',
    displayName: couple?.name || prof.display_name || '',
    coupleId
  };
}

// --- provider --------------------------------------------------------------

function readLocalSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseMode = isSupabaseBackend();
  // Modo local: a sessão é lida de forma SÍNCRONA no arranque para que o
  // <RequireAuth> já a veja no primeiro render (evita a corrida em que o
  // <Navigate> dispara antes do estado ser preenchido). No modo Supabase a
  // sessão chega de forma assíncrona via onAuthStateChange.
  const [session, setSession] = useState<AuthSession | null>(() =>
    supabaseMode ? null : readLocalSession()
  );

  useEffect(() => {
    if (supabaseMode) {
      const supabase = getSupabase();
      let active = true;

      supabase.auth.getSession().then(async ({ data }) => {
        if (!active) return;
        setSession(data.session ? await buildSessionFromUser(data.session.user) : null);
      });

      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
        setSession(sess ? await buildSessionFromUser(sess.user) : null);
      });

      return () => {
        active = false;
        sub.subscription.unsubscribe();
      };
    }

    // Modo local: garante a camada de dados semeada.
    WeddingStorageService.init();
  }, [supabaseMode]);

  const login = useCallback(
    async (email: string, password?: string): Promise<{ ok: boolean; error?: string }> => {
      const normalized = email.trim().toLowerCase();

      if (supabaseMode) {
        if (!password) return { ok: false, error: 'Indique a palavra-passe (o seu número de WhatsApp).' };
        const { data, error } = await getSupabase().auth.signInWithPassword({ email: normalized, password });
        if (error) return { ok: false, error: friendlyAuthError(error.message) };
        const s = await buildSessionFromUser(data.session.user);
        if (!s) return { ok: false, error: 'Conta sem perfil associado. Contacte a plataforma.' };
        if (s.role === 'cliente' && s.coupleId) {
          const couple = await getRepo().getCoupleById(s.coupleId);
          if (couple?.status === 'suspended') {
            await getSupabase().auth.signOut();
            return { ok: false, error: 'Esta conta encontra-se suspensa. Contacte a plataforma.' };
          }
        }
        setSession(s);
        return { ok: true };
      }

      // Modo local ---------------------------------------------------------
      const admin = getAdminAccounts().find((a) => a.email === normalized);
      if (admin) {
        if (admin.password !== password) return { ok: false, error: 'Palavra-passe incorreta.' };
        const next: AuthSession = { role: 'admin', email: admin.email, displayName: admin.displayName };
        localStorage.setItem(SESSION_KEY, JSON.stringify(next));
        setSession(next);
        return { ok: true };
      }

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
    },
    [supabaseMode]
  );

  const register = useCallback(
    async (params: {
      name: string;
      email: string;
      whatsapp: string;
      occasion: OccasionId;
      plan?: PlanId;
    }): Promise<RegisterResult> => {
      const email = params.email.trim().toLowerCase();
      const name = params.name.trim();

      if (!name) return { ok: false, error: 'Indique o seu nome.' };
      if (!email || !email.includes('@')) return { ok: false, error: 'Indique um email válido.' };
      if (!params.whatsapp.trim()) return { ok: false, error: 'Indique o seu número de WhatsApp.' };

      if (supabaseMode) {
        const password = phoneAsPassword(params.whatsapp);
        const { data, error } = await getSupabase().auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
              aura_name: name,
              aura_phone: params.whatsapp.trim(),
              aura_occasion: params.occasion,
              aura_plan: params.plan ?? 'starter'
            }
          }
        });

        if (error) return { ok: false, error: friendlyAuthError(error.message) };

        // Confirmação de email desligada num futuro → sessão imediata.
        if (data.session) {
          const s = await buildSessionFromUser(data.session.user);
          setSession(s);
          return { ok: true };
        }
        return { ok: true, pendingConfirmation: true };
      }

      // Modo local ---------------------------------------------------------
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
    [supabaseMode]
  );

  const logout = useCallback(() => {
    if (supabaseMode) {
      void getSupabase().auth.signOut();
      setSession(null);
      return;
    }
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, [supabaseMode]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<{ ok: boolean; error?: string }> => {
      const normalized = email.trim().toLowerCase();
      if (!normalized || !normalized.includes('@')) {
        return { ok: false, error: 'Indique um email válido.' };
      }
      if (!supabaseMode) {
        return { ok: false, error: 'A recuperação de palavra-passe está disponível apenas para as contas activas.' };
      }
      // Respeita o subcaminho do host (ex.: GitHub Pages /aura-nupcial/).
      const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/+$/, '');
      const redirectTo = `${window.location.origin}${base}/redefinir`;
      const { error } = await getSupabase().auth.resetPasswordForEmail(normalized, { redirectTo });
      if (error) return { ok: false, error: friendlyAuthError(error.message) };
      return { ok: true };
    },
    [supabaseMode]
  );

  const setNewPassword = useCallback(
    async (password: string): Promise<{ ok: boolean; error?: string }> => {
      if (!supabaseMode) {
        return { ok: false, error: 'A alteração de palavra-passe está disponível apenas para as contas activas.' };
      }
      if (!password || password.length < 8) {
        return { ok: false, error: 'A palavra-passe deve ter pelo menos 8 caracteres.' };
      }
      const { error } = await getSupabase().auth.updateUser({ password });
      if (error) return { ok: false, error: friendlyAuthError(error.message) };
      return { ok: true };
    },
    [supabaseMode]
  );

  const value = useMemo(
    () => ({ session, login, register, logout, requestPasswordReset, setNewPassword }),
    [session, login, register, logout, requestPasswordReset, setNewPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
