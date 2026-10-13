import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, Send } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';

/**
 * ESQUECI A PALAVRA-PASSE — pedido de redefinição por email.
 * Só existe em modo Supabase: envia o link de redefinição do Supabase Auth
 * para o email do casal. Não revela se o email existe ou não.
 */
export const EsqueciSenhaPage: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await requestPasswordReset(email);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || 'Não foi possível enviar o email.');
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="max-w-lg mx-auto text-center bg-white border border-stone-200 rounded-xs p-8 shadow-xs">
          <MailCheck className="w-8 h-8 text-[#5E6B56] mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-stone-900 mb-3">Email enviado</h2>
          <p className="text-sm text-stone-600 font-sans leading-relaxed">
            Se existir uma conta com{' '}
            <span className="font-medium text-stone-900">{email.trim()}</span>, receberá uma
            mensagem com o link para definir uma nova palavra-passe. O link expira dentro de
            pouco tempo.
          </p>
          <p className="text-[11px] text-stone-500 font-sans mt-4">
            Não encontrou o email? Verifique a pasta de spam ou{' '}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-[#5E6B56] hover:underline cursor-pointer"
            >
              tente novamente
            </button>
            .
          </p>
          <div className="mt-6 pt-5 border-t border-stone-200">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-sans text-[#5E6B56] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <div className="text-center mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">Acesso</p>
        <h1 className="font-serif text-4xl text-stone-900">Recuperar palavra-passe</h1>
        <p className="mt-3 text-sm text-stone-600 font-sans">
          Indique o email da sua conta. Enviamos-lhe um link para definir uma nova
          palavra-passe.
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
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {busy ? 'A enviar…' : 'Enviar link de recuperação'}
          </button>

          <p className="text-[11px] text-stone-500 font-sans text-center leading-relaxed">
            Lembrou a palavra-passe?{' '}
            <Link to="/login" className="text-[#5E6B56] hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
