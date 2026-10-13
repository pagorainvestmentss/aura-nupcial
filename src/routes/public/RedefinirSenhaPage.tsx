import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';

function hasRecoveryHash(): boolean {
  const hash = window.location.hash;
  return hash.includes('type=recovery') || hash.includes('access_token=');
}

/**
 * REDEFINIR PALAVRA-PASSE — destino do link enviado por email.
 * O Supabase Auth processa o link (detectSessionInUrl) e abre uma sessão
 * temporária de recuperação; só então o formulário fica disponível.
 */
export const RedefinirSenhaPage: React.FC = () => {
  const { session, setNewPassword } = useAuth();
  const navigate = useNavigate();

  const linkValido = React.useMemo(() => hasRecoveryHash(), []);
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As duas palavras-passe não coincidem.');
      return;
    }
    setBusy(true);
    const result = await setNewPassword(password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'Não foi possível guardar a nova palavra-passe.');
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="max-w-lg mx-auto text-center bg-white border border-stone-200 rounded-xs p-8 shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-[#5E6B56] mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-stone-900 mb-3">Palavra-passe alterada</h2>
          <p className="text-sm text-stone-600 font-sans leading-relaxed">
            Já pode entrar na plataforma com a sua nova palavra-passe.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  if (!linkValido) {
    return (
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="max-w-lg mx-auto text-center bg-white border border-stone-200 rounded-xs p-8 shadow-xs">
          <KeyRound className="w-8 h-8 text-[#5E6B56] mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-stone-900 mb-3">Link inválido</h2>
          <p className="text-sm text-stone-600 font-sans leading-relaxed">
            Este link não é válido ou já foi usado. Peça um novo link de recuperação.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              to="/esqueci-a-palavra-passe"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
            >
              Pedir novo link
            </Link>
            <Link
              to="/login"
              className="text-[11px] uppercase tracking-wider font-sans text-[#5E6B56] hover:underline"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Link válido mas a sessão de recuperação ainda não chegou.
  if (!session) {
    return (
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="max-w-md mx-auto text-center bg-white border border-stone-200 rounded-xs p-6 sm:p-7 shadow-xs">
          <p className="text-sm text-stone-600 font-sans">A verificar o link…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <div className="text-center mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">Acesso</p>
        <h1 className="font-serif text-4xl text-stone-900">Nova palavra-passe</h1>
        <p className="mt-3 text-sm text-stone-600 font-sans">
          Escolha a palavra-passe que quer usar a partir de agora.
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-xs p-6 sm:p-7 shadow-xs">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
              Nova palavra-passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
              className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
              Repetir palavra-passe
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Escreva a mesma palavra-passe"
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
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <KeyRound className="w-4 h-4" />
            {busy ? 'A guardar…' : 'Guardar palavra-passe'}
          </button>
        </form>
      </div>
    </div>
  );
};
