import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Reveal } from '../../components/motion/Reveal';
import { EASE_OUT, staggerChild } from '../../components/motion/variants';

const PLANS = [
  {
    name: 'Starter',
    price: '45.000',
    currency: 'Kz',
    period: 'pagamento único',
    highlight: false,
    features: [
      'Convite digital personalizado',
      'Até 30 convidados',
      'Links individuais intransmissíveis',
      'RSVP em tempo real',
      'Cronograma, versículo e galeria',
      'Envio por WhatsApp',
      'Suporte por email'
    ]
  },
  {
    name: 'Pro',
    price: '120.000',
    currency: 'Kz',
    period: 'pagamento único',
    highlight: true,
    features: [
      'Tudo do Starter',
      'Até 100 convidados',
      'QR Code de check-in no dia',
      'Manual do convidado e declarações',
      'Música ambiente no convite',
      'Até 2 revisões de design',
      'Suporte prioritário WhatsApp',
      'Relatório de confirmações exportável'
    ]
  },
  {
    name: 'Premium',
    price: '200.000',
    currency: 'Kz',
    period: 'pagamento único',
    highlight: false,
    features: [
      'Tudo do Pro',
      'Ilimitados convidados',
      'Galeria de fotos ilimitada',
      'Até 5 revisões de design',
      'Prioridade absoluta no suporte',
      'Análises avançadas (who confirmed, check-in times)',
      'Domínio personalizado para o convite'
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

      <Reveal stagger className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {PLANS.map((p) => (
          <motion.div
            key={p.name}
            variants={staggerChild}
            whileHover={{ y: -4 }}
            whileTap={{ y: 0, transition: { duration: 0.18, ease: EASE_OUT } }}
            className={`relative bg-white border rounded-xs p-7 flex flex-col h-full ${
              p.highlight ? 'border-[#5E6B56] shadow-lg' : 'border-stone-200 shadow-xs'
            }`}
          >
            {p.highlight && (
              <motion.span
                variants={{
                  hidden: { opacity: 0, scale: 0.8, y: -4, x: '-50%' },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: '-50%',
                    transition: { type: 'spring', stiffness: 320, damping: 20, delay: 0.2 }
                  }
                }}
                className="absolute -top-3 left-1/2 text-[10px] uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] px-3 py-1 rounded-full"
              >
                Mais escolhido
              </motion.span>
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
              className={`press mt-7 inline-flex items-center justify-center px-5 py-3 text-xs uppercase tracking-[0.2em] font-semibold rounded-xs transition-colors ${
                p.highlight
                  ? 'text-white bg-[#5E6B56] hover:bg-[#4E5B46]'
                  : 'text-stone-800 bg-white border border-stone-300 hover:bg-stone-50'
              }`}
            >
              Escolher {p.name}
            </Link>
          </motion.div>
        ))}
      </Reveal>

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
