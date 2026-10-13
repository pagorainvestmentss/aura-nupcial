import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import { isSupabaseBackend } from '../../services/supabase/client';

/**
 * Login EXCLUSIVO do cliente (casal) — email + palavra-passe.
 * MODO SUPABASE (produção): a palavra-passe é o número de WhatsApp (E.164)
 * definido no registo. MODO LOCAL (dev/testes): apenas o email é validado.
 * O administrador entra em /admin. O convidado não tem conta — usa o link do
 * convite (/convite/:eventSlug/:guestToken).
 */
export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: string } | null)?.from ||
    (new URLSearchParams(location.search).get('next') ?? '');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const supabaseMode = isSupabaseBackend();

  const redirectAfter = () => {
    navigate(from.startsWith('/cliente') ? from : '/cliente', { replace: true });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await login(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'Falha no início de sessão.');
      return;
    }
    redirectAfter();
  };

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <div className="text-center mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">Acesso</p>
        <h1 className="font-serif text-4xl text-stone-900">Entrar na plataforma</h1>
        <p className="mt-3 text-sm text-stone-600 font-sans">
          O casal entra com o email e a palavra-passe (o número de WhatsApp). Os convidados não
          precisam de conta — usam o link do convite.
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-xs p-6 sm:p-7 shadow-xs">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="o.seu.email@exemplo.com"
              className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
            />
          </div>

          {supabaseMode && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                Palavra-passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="O seu número de WhatsApp"
                className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
              />
              <div className="text-right mt-1.5">
                <Link
                  to="/esqueci-a-palavra-passe"
                  className="text-[11px] text-[#5E6B56] hover:underline font-sans"
                >
                  Esqueci a palavra-passe
                </Link>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 font-sans bg-red-50 border border-red-200 px-3 py-2 rounded-xs">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            {busy ? 'A entrar…' : 'Entrar'}
          </button>

          <p className="text-[11px] text-stone-500 font-sans text-center leading-relaxed">
            Ainda não tem conta?{' '}
            <Link to="/criar" className="text-[#5E6B56] hover:underline">
              Criar uma conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
