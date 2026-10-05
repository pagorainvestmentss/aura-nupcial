import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { OccasionPicker } from '../../components/public/OccasionPicker';
import { OccasionId } from '../../types/wedding';

const POINTS = [
  'A partir de 85.000 Kz — pagamento único',
  'Conta em segundos: email e WhatsApp',
  'Você preenche o convite no seu painel, no seu ritmo',
  'Convidado nunca precisa de conta'
];

/**
 * /ADQUIRIR — selector das 4 ocasiões. Cada escolha segue para /criar?ocasiao=…
 * (o URL mantém-se estável; /pacotes continua a ser a página de preços).
 */
export const AdquirirPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = React.useState<OccasionId | undefined>(undefined);

  const goCreate = () => {
    navigate(selected ? `/criar?ocasiao=${selected}` : '/criar');
  };

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">
          Começar
        </p>
        <h1 className="font-serif text-4xl text-stone-900">
          Que ocasião está a preparar?
        </h1>
        <p className="mt-4 text-sm text-stone-600 font-sans leading-relaxed">
          Escolha a ocasião e criamos na hora a estrutura certa do seu convite.
          Depois é só preencher os campos no painel — com exemplos sempre à vista.
        </p>
      </div>

      <OccasionPicker selected={selected} onSelect={setSelected} />

      <div className="mt-8 bg-white border border-stone-200 rounded-xs p-7 shadow-xs">
        <ul className="space-y-3">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm text-stone-700 font-sans">
              <Check className="w-4 h-4 text-[#5E6B56] mt-0.5 shrink-0" />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-7 pt-6 border-t border-stone-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={goCreate}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer"
          >
            Criar convite
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/pacotes"
            className="flex-1 inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
          >
            Ver pacotes
          </Link>
          <Link
            to="/login"
            className="flex-1 inline-flex items-center justify-center px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-[#F4EFE6] border border-stone-200 p-6 rounded-xs text-center">
        <p className="font-serif text-lg text-stone-800">
          Prefere começar por ver como ficam os convites?
        </p>
        <Link
          to="/exemplos"
          className="inline-block mt-3 text-xs uppercase tracking-[0.2em] font-semibold text-[#5E6B56] hover:underline"
        >
          Ver exemplos →
        </Link>
      </div>
    </div>
  );
};
