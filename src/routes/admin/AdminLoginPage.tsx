import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';

/**
 * Login EXCLUSIVO do administrador — vive em /admin (sem sessão).
 * Nunca é referenciado pelo site público. Cliente usa /login.
 */
export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from || '';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error || 'Falha no início de sessão.');
      return;
    }
    navigate(from.startsWith('/admin') ? from : '/admin', { replace: true });
  };

  const quickLogin = () => {
    setError('');
    const result = login('admin@auranupcial.com', 'admin123');
    if (!result.ok) {
      setError(result.error || 'Falha no início de sessão.');
      return;
    }
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <h1 className="font-serif text-2xl text-white">Administração Aura Nupcial</h1>
          <p className="mt-2 text-xs text-slate-400 font-sans">
            Acesso restrito à equipa da plataforma.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 bg-slate-800 border border-slate-700 rounded-xs p-6">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email de administração"
              className="w-full py-2.5 px-3 text-sm font-sans bg-slate-900 border border-slate-600 text-white rounded-xs focus:outline-none focus:border-[#8FA086]"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-slate-300 mb-1">
              Palavra-passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full py-2.5 px-3 text-sm font-sans bg-slate-900 border border-slate-600 text-white rounded-xs focus:outline-none focus:border-[#8FA086]"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-sans bg-red-950 border border-red-900 px-3 py-2 rounded-xs">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-xs transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Entrar
          </button>

          {/* Acesso rápido de demonstração — apenas em desenvolvimento. */}
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={quickLogin}
              className="w-full px-3 py-2.5 text-[11px] font-sans font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-700/50 rounded-xs transition-colors cursor-pointer"
            >
              Entrar como admin (demonstração)
            </button>
          )}
        </form>

        {import.meta.env.DEV && (
          <p className="text-center text-[11px] text-slate-500 font-sans mt-4">
            Admin: admin@auranupcial.com / admin123
          </p>
        )}
      </div>
    </div>
  );
};
