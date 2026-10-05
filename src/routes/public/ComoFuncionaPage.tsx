import React from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    n: '01',
    title: 'Crie a sua conta',
    text: 'Escolha a ocasião — casamento, noivado, aniversário ou outra celebração — e registe-se com email e WhatsApp. A plataforma prepara o seu convite na hora.'
  },
  {
    n: '02',
    title: 'Escolha o pacote',
    text: 'Essential (até 80 convidados) ou Pro (ilimitados, com QR Code e música). O pagamento é único e confirmado pela nossa equipa.'
  },
  {
    n: '03',
    title: 'Preencha os dados',
    text: 'No seu painel, edita nomes, data, locais, horários, versículo, cronograma, declarações e mensagem final — cada campo tem um exemplo à vista.'
  },
  {
    n: '04',
    title: 'Adicione os convidados',
    text: 'Cada convidado recebe um link individual e intransmissível com o seu nome. Pode enviar por WhatsApp directamente do painel.'
  },
  {
    n: '05',
    title: 'Publique o convite',
    text: 'Confirme o pagamento, veja o convite como um convidado veria e publique. Em minutos, está pronto a partilhar.'
  },
  {
    n: '06',
    title: 'RSVP e check-in',
    text: 'As confirmações chegam em tempo real para o seu painel. No dia do evento, cada convidado é validado por QR Code à entrada.'
  }
];

export const ComoFuncionaPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">
          O processo
        </p>
        <h1 className="font-serif text-4xl text-stone-900">Como funciona</h1>
        <p className="mt-4 text-sm text-stone-600 font-sans leading-relaxed">
          Seis passos simples, do primeiro clique ao dia do evento. Sem instalações,
          sem aplicações — tudo acontece no navegador, no seu ritmo.
        </p>
      </div>

      <div className="space-y-5">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="grid sm:grid-cols-[80px_1fr] gap-4 bg-white border border-stone-200 p-6 rounded-xs"
          >
            <span className="font-serif text-4xl text-[#D8DFD5] leading-none">{s.n}</span>
            <div>
              <h2 className="font-serif text-xl text-stone-900">{s.title}</h2>
              <p className="text-sm text-stone-600 leading-relaxed mt-1.5 font-sans">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center bg-[#F4EFE6] border border-stone-200 p-8 rounded-xs">
        <h3 className="font-serif text-2xl text-stone-900">
          Quer ver um convite a funcionar?
        </h3>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            to="/criar"
            className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
          >
            Criar convite
          </Link>
          <Link
            to="/convite/mariana-pedro/8Fk92KsP"
            className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
          >
            Abrir convite de demonstração
          </Link>
          <Link
            to="/pacotes"
            className="px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
          >
            Ver pacotes
          </Link>
        </div>
      </div>
    </div>
  );
};
