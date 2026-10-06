import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Reveal, RevealItem } from '../../components/motion/Reveal';
import { DURATION, EASE_OUT } from '../../components/motion/variants';

const FAQS = [
  {
    q: 'O que é exactamente o Aura Nupcial?',
    a: 'Uma plataforma de convites digitais de autor. Você cria a conta, escolhe a ocasião e preenche o convite no seu painel — inspirado em papelaria editorial de luxo, com RSVP em tempo real e check-in por QR Code.'
  },
  {
    q: 'Que ocasiões posso criar?',
    a: 'Casamento, noivado, aniversário ou outra celebração (batizado, jantar de empresa, etc.). A ocasião é escolhida ao criar a conta e adapta os campos e o convite.'
  },
  {
    q: 'Os meus convidados precisam de criar conta?',
    a: 'Não. O convidado apenas abre o link que recebeu — sem registo, sem app, sem passwords. Cada link é individual e intransmissível.'
  },
  {
    q: 'O que é um link intransmissível?',
    a: 'Cada convidado tem um endereço único (por exemplo /convite/mariana-pedro/a8K92Lm) que abre o convite com o seu nome. Se for encaminhado, a pessoa vê o nome de quem foi convidado — o convite é pessoal.'
  },
  {
    q: 'Como funcionam as confirmações de presença (RSVP)?',
    a: 'No fim do convite, o convidado confirma presença, indica quantas pessoas vão e deixa observações. Tudo aparece de imediato no seu painel e no painel administrativo.'
  },
  {
    q: 'O que é o QR Code no dia do evento?',
    a: 'No pacote Pro, cada convidado confirmado recebe um QR Code no convite. À entrada, a equipa valida o código num terminal de check-in — entrada rápida, sem listas de papel, sem duplicados.'
  },
  {
    q: 'Posso alterar os dados depois de publicar?',
    a: 'Sim. Pode editar textos, fotos, horários e convidados a qualquer momento; as alterações reflectem-se de imediato no link dos convidados.'
  },
  {
    q: 'Quanto tempo demora a ficar pronto?',
    a: 'A conta e a estrutura do convite ficam prontos em segundos. Depois é só preencher os campos no seu ritmo — e publicar assim que o pagamento for confirmado pela nossa equipa (normalmente em poucas horas).'
  },
  {
    q: 'O convite funciona em telemóveis?',
    a: 'Sim — a experiência foi desenhada primeiro para o telemóvel, com scroll vertical, tipografia legível e carregamento rápido.'
  }
];

export const FaqPage: React.FC = () => {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="text-center mb-10">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">
          Dúvidas frequentes
        </p>
        <h1 className="font-serif text-4xl text-stone-900">Perguntas frequentes</h1>
      </div>

      <Reveal stagger staggerGap={0.05} className="space-y-3">
        {FAQS.map((f, i) => (
          <RevealItem key={f.q}>
            <div className="bg-white border border-stone-200 rounded-xs">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={open === i}
              >
                <span className="font-serif text-lg text-stone-900">{f.q}</span>
                <span
                  className="relative w-5 h-5 flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={open === i ? 'aberto' : 'fechado'}
                      initial={{ opacity: 0, scale: 0.5, rotate: open === i ? -90 : 90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: open === i ? 90 : -90 }}
                      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
                      className="absolute text-[#5E6B56] text-xl leading-none"
                    >
                      {open === i ? '\u2212' : '+'}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="resposta"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-stone-600 leading-relaxed font-sans">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </RevealItem>
        ))}
      </Reveal>

      <div className="text-center mt-10">
        <p className="text-sm text-stone-600 font-sans">
          Não encontrou a sua resposta?
        </p>
        <Link
          to="/contacto"
          className="press inline-block mt-3 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
        >
          Falar connosco
        </Link>
      </div>
    </div>
  );
};
