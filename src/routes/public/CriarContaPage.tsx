import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';
import { OccasionPicker } from '../../components/public/OccasionPicker';
import { OccasionId, PlanId } from '../../types/wedding';
import { getOccasion } from '../../data/occasions';

/**
 * CRIAR CONTA — passo do funil depois da escolha da ocasião.
 * Cria conta (email + WhatsApp) + evento em branco e entra no painel.
 * Pacote via ?plano= ou escolhido dentro do painel (fase seguinte).
 */
export const CriarContaPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const paramOccasion = params.get('ocasiao') as OccasionId | null;
  const paramPlan = params.get('plano') as PlanId | null;

  const [step, setStep] = React.useState<'pick' | 'form'>(paramOccasion ? 'form' : 'pick');
  const [occasion, setOccasion] = React.useState<OccasionId | null>(paramOccasion);
  const [plan, setPlan] = React.useState<PlanId>(paramPlan === 'premium' ? 'premium' : paramPlan === 'pro' ? 'pro' : 'starter');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [error, setError] = React.useState('');

  const def = occasion ? getOccasion(occasion) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!occasion) return;
    const result = register({ name, email, whatsapp, occasion, plan });
    if (!result.ok) {
      setError(result.error || 'Não foi possível criar a conta.');
      return;
    }
    navigate('/cliente', { replace: true });
  };

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
      <div className="text-center mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">
          {step === 'pick' ? 'Passo 1 de 2' : 'Passo 2 de 2'}
        </p>
        <h1 className="font-serif text-4xl text-stone-900">Criar a sua conta</h1>
        <p className="mt-3 text-sm text-stone-600 font-sans leading-relaxed max-w-lg mx-auto">
          {step === 'pick'
            ? 'Primeiro, diga-nos que ocasião está a preparar — adaptamos o convite e os campos em função disso.'
            : 'Só precisa de email e WhatsApp. Depois, o painel guia-o passo a passo até publicar.'}
        </p>
      </div>

      {step === 'pick' ? (
        <div>
          <OccasionPicker
            onSelect={(id) => {
              setOccasion(id);
              setStep('form');
            }}
          />
          <p className="text-center text-xs text-stone-500 font-sans mt-8">
            Já tem conta?{' '}
            <Link to="/login" className="text-[#5E6B56] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xs p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-200">
            <div className="flex items-center gap-2 text-sm font-sans text-stone-700">
              {def && <def.icon className="w-4 h-4 text-[#5E6B56]" />}
              <span>{def?.label}</span>
            </div>
            <button
              type="button"
              onClick={() => setStep('pick')}
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-sans text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Mudar ocasião
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                O seu nome
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Mariana Costa"
                className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
              />
            </div>

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

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex.: +244 923 000 000"
                className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-2">
                Pacote (pode mudar depois no painel)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['starter', 'pro', 'premium'] as PlanId[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`p-3 rounded-xs border text-left cursor-pointer transition-colors ${
                      plan === p
                        ? 'border-[#5E6B56] bg-white shadow-sm'
                        : 'border-stone-200 bg-[#FAF7F2] hover:border-stone-300'
                    }`}
                  >
                    <p className="font-serif text-base text-stone-900">
                      {p === 'starter' ? 'Starter' : p === 'pro' ? 'Pro' : 'Premium'}
                    </p>
                    <p className="text-[11px] font-sans text-stone-500 mt-0.5">
                      {p === 'starter' ? 'Até 30 convidados' : p === 'pro' ? 'Até 100 convidados' : 'Ilimitados'}
                    </p>
                  </button>
                ))}
              </div>
              <Link
                to="/pacotes"
                className="inline-block mt-2 text-[11px] font-sans text-[#5E6B56] hover:underline"
              >
                Ver detalhes dos pacotes →
              </Link>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-sans bg-red-50 border border-red-200 px-3 py-2 rounded-xs">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Criar conta e começar
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-stone-500 font-sans text-center leading-relaxed">
              Sem palavra-passe — entra com o email. Já tem conta?{' '}
              <Link to="/login" className="text-[#5E6B56] hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </div>
      )}
    </div>
  );
};
