import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';

/**
 * Login EXCLUSIVO do cliente (casal) — apenas email, sem palavra-passe.
 * O administrador entra em /admin (AdminLoginPage). O convidado não tem
 * conta: acede por token em /convite/:eventSlug/:guestToken.
 */
export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: string } | null)?.from ||
    (new URLSearchParams(location.search).get('next') ?? '');

  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');

  const redirectAfter = () => {
    navigate(from.startsWith('/cliente') ? from : '/cliente', { replace: true });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email);
    if (!result.ok) {
      setError(result.error || 'Falha no início de sessão.');
      return;
    }
    redirectAfter();
  };

  const quickLogin = () => {
    setError('');
    const result = login('mariana.pedro@auranupcial.com');
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
          Cliente entra só com o email. Os convidados não precisam de conta — usam o link do convite.
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

          {error && (
            <p className="text-xs text-red-600 font-sans bg-red-50 border border-red-200 px-3 py-2 rounded-xs">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </button>

          <p className="text-[11px] text-stone-500 font-sans text-center leading-relaxed">
            Ainda não tem conta?{' '}
            <Link to="/criar" className="text-[#5E6B56] hover:underline">
              Criar uma conta
            </Link>
          </p>
        </form>

        {/* Acesso rápido de demonstração — apenas em desenvolvimento. */}
        {import.meta.env.DEV && (
          <div className="mt-5 pt-5 border-t border-stone-200">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 text-center mb-3">
              Acesso rápido de demonstração
            </p>
            <button
              onClick={quickLogin}
              className="w-full px-3 py-2.5 text-[11px] font-sans font-medium text-stone-700 bg-[#FAF7F2] border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors cursor-pointer"
            >
              Entrar como cliente
            </button>
            <p className="text-[11px] text-stone-500 font-sans mt-3 text-center leading-relaxed">
              Cliente: mariana.pedro@auranupcial.com (sem palavra-passe)
            </p>
          </div>
        )}
      </div>

      {import.meta.env.DEV && (
        <p className="text-center text-xs text-stone-500 font-sans mt-6">
          É convidado?{' '}
          <Link
            to="/convite/mariana-pedro/8Fk92KsP"
            className="text-[#5E6B56] hover:underline"
          >
            Abra directamente o seu convite
          </Link>
        </p>
      )}
    </div>
  );
};
