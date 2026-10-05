import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Essential',
    price: '85.000',
    currency: 'Kz',
    period: 'pagamento único',
    highlight: false,
    features: [
      'Convite digital personalizado',
      'Até 80 convidados',
      'Links individuais intransmissíveis',
      'RSVP em tempo real',
      'Cronograma, versículo e galeria',
      'Envio por WhatsApp',
      'Suporte por email'
    ]
  },
  {
    name: 'Pro',
    price: '150.000',
    currency: 'Kz',
    period: 'pagamento único',
    highlight: true,
    features: [
      'Tudo do Essential',
      'Convidados ilimitados',
      'QR Code de check-in no dia',
      'Manual do convidado e declarações',
      'Música ambiente no convite',
      'Até 3 revisões de design',
      'Suporte prioritário WhatsApp',
      'Relatório de confirmações exportável'
    ]
  }
];

export const PacotesPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">Investimento</p>
        <h1 className="font-serif text-4xl text-stone-900">Pacotes</h1>
        <p className="mt-4 text-sm text-stone-600 font-sans leading-relaxed">
          Preço fixo, sem subscrições. Escolha o pacote, crie a conta e comece
          já a preencher o seu convite.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative bg-white border rounded-xs p-7 flex flex-col ${
              p.highlight ? 'border-[#5E6B56] shadow-lg' : 'border-stone-200 shadow-xs'
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] px-3 py-1 rounded-full">
                Mais escolhido
              </span>
            )}
            <h2 className="font-serif text-2xl text-stone-900">{p.name}</h2>
            <div className="mt-3 flex items-end gap-1.5">
              <span className="font-serif text-4xl text-stone-900">{p.price}</span>
              <span className="text-sm text-stone-500 font-sans mb-1">{p.currency}</span>
            </div>
            <p className="text-[11px] uppercase tracking-widest text-stone-400 mt-1">
              {p.period}
            </p>

            <ul className="mt-6 space-y-2.5 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-stone-600 font-sans">
                  <Check className="w-3.5 h-3.5 text-[#5E6B56] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to={`/criar?plano=${p.name.toLowerCase()}`}
              className={`mt-7 inline-flex items-center justify-center px-5 py-3 text-xs uppercase tracking-[0.2em] font-semibold rounded-xs transition-colors ${
                p.highlight
                  ? 'text-white bg-[#5E6B56] hover:bg-[#4E5B46]'
                  : 'text-stone-800 bg-white border border-stone-300 hover:bg-stone-50'
              }`}
            >
              Escolher {p.name}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-stone-500 font-sans mt-8">
        Precisa de algo à medida?{' '}
        <Link to="/contacto" className="text-[#5E6B56] hover:underline">
          Fale connosco
        </Link>{' '}
        para um orçamento personalizado.
      </p>
    </div>
  );
};
