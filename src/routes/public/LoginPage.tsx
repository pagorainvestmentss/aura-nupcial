import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';

/**
 * Login único com dois ambientes separados:
 *  - ADMIN    → /admin    (email + palavra-passe)
 *  - CLIENTE  → /cliente  (apenas email — sem palavra-passe)
 * O convidado NÃO tem conta: acede por token em /convite/:eventSlug/:guestToken.
 */
export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: string } | null)?.from ||
    (new URLSearchParams(location.search).get('next') ?? '');

  const [mode, setMode] = React.useState<'cliente' | 'admin'>('cliente');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const redirectFor = (role: 'admin' | 'cliente', fallback: string) => {
    const target = from && from !== fallback ? from : fallback;
    const allowed =
      (role === 'admin' && target.startsWith('/admin')) ||
      (role === 'cliente' && target.startsWith('/cliente'));
    navigate(allowed ? target : fallback, { replace: true });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email, mode === 'admin' ? password : undefined);
    if (!result.ok) {
      setError(result.error || 'Falha no início de sessão.');
      return;
    }
    redirectFor(mode, mode === 'admin' ? '/admin' : '/cliente');
  };

  const quickLogin = (quickMode: 'cliente' | 'admin') => {
    setError('');
    const result =
      quickMode === 'admin'
        ? login('admin@auranupcial.com', 'admin123')
        : login('mariana.pedro@auranupcial.com');
    if (!result.ok) {
      setError(result.error || 'Falha no início de sessão.');
      return;
    }
    redirectFor(quickMode === 'admin' ? 'admin' : 'cliente', quickMode === 'admin' ? '/admin' : '/cliente');
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

      {/* Selector de ambiente */}
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
        <button
          onClick={() => setMode('cliente')}
          className={`text-left p-5 rounded-xs border transition-colors cursor-pointer ${
            mode === 'cliente'
              ? 'border-[#5E6B56] bg-white shadow-md'
              : 'border-stone-200 bg-[#FAF7F2] hover:border-stone-300'
          }`}
        >
          <HeartHandshake
            className={`w-5 h-5 mb-2 ${mode === 'cliente' ? 'text-[#5E6B56]' : 'text-stone-400'}`}
          />
          <p className="font-serif text-lg text-stone-900">Sou cliente</p>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Gerir o meu convite e convidados — só email
          </p>
        </button>

        <button
          onClick={() => setMode('admin')}
          className={`text-left p-5 rounded-xs border transition-colors cursor-pointer ${
            mode === 'admin'
              ? 'border-slate-700 bg-white shadow-md'
              : 'border-stone-200 bg-[#FAF7F2] hover:border-stone-300'
          }`}
        >
          <ShieldCheck
            className={`w-5 h-5 mb-2 ${mode === 'admin' ? 'text-slate-700' : 'text-stone-400'}`}
          />
          <p className="font-serif text-lg text-stone-900">Sou administrador</p>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Gestão da plataforma Aura Nupcial
          </p>
        </button>
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
              placeholder={mode === 'admin' ? 'admin@auranupcial.com' : 'o.seu.email@exemplo.com'}
              className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
            />
          </div>
          {mode === 'admin' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                Palavra-passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
              />
            </div>
          )}

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

          {mode === 'cliente' && (
            <p className="text-[11px] text-stone-500 font-sans text-center leading-relaxed">
              Ainda não tem conta?{' '}
              <Link to="/criar" className="text-[#5E6B56] hover:underline">
                Criar uma conta
              </Link>
            </p>
          )}
        </form>

        <div className="mt-5 pt-5 border-t border-stone-200">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 text-center mb-3">
            Acesso rápido de demonstração
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin('cliente')}
              className="px-3 py-2.5 text-[11px] font-sans font-medium text-stone-700 bg-[#FAF7F2] border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors cursor-pointer"
            >
              Entrar como cliente
            </button>
            <button
              onClick={() => quickLogin('admin')}
              className="px-3 py-2.5 text-[11px] font-sans font-medium text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-xs transition-colors cursor-pointer"
            >
              Entrar como admin
            </button>
          </div>
          <p className="text-[11px] text-stone-500 font-sans mt-3 text-center leading-relaxed">
            Cliente: mariana.pedro@auranupcial.com (sem palavra-passe)
            <br />
            Admin: admin@auranupcial.com / admin123
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-stone-500 font-sans mt-6">
        É convidado?{' '}
        <Link
          to="/convite/mariana-pedro/8Fk92KsP"
          className="text-[#5E6B56] hover:underline"
        >
          Abra directamente o seu convite
        </Link>
      </p>
    </div>
  );
};
