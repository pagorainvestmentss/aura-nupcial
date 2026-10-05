import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import paperTexture from '../../assets/images/luxury_paper_texture_1791141333707.jpg';
import coupleEditorial from '../../assets/images/couple_editorial.jpg';
import { OCCASION_LIST } from '../../data/occasions';

const STEPS = [
  { n: '01', title: 'Crie a sua conta', text: 'Email e WhatsApp, escolha da ocasião e do pacote — a plataforma prepara o seu convite na hora.' },
  { n: '02', title: 'Você preenche', text: 'Nomes, data, locais, versículo, cronograma e mensagem final — tudo com exemplos à vista num painel simples.' },
  { n: '03', title: 'Convidados recebem o link', text: 'Cada convidado recebe um convite individual e intransmissível, com o seu nome na abertura.' },
  { n: '04', title: 'Confirmações em tempo real', text: 'RSVP reunido num só lugar, com QR Code de check-in no dia do evento.' }
];

const FEATURES = [
  'Convite individual com o nome de cada convidado',
  'Envelope digital com abertura cinematográfica',
  'Confirmações de presença em tempo real',
  'QR Code de validação à entrada',
  'Galeria, cronograma e manual do convidado',
  'Envio direto por WhatsApp'
];

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-stone-200"
        style={{
          backgroundImage: `linear-gradient(rgba(250,247,242,0.92), rgba(250,247,242,0.97)), url(${paperTexture})`,
          backgroundSize: 'cover'
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#5E6B56] font-medium mb-5">
              Convites digitais de autor
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-stone-900">
              O convite da sua celebração,
              <span className="block italic text-[#5E6B56]">reimaginado em digital.</span>
            </h1>
            <p className="mt-6 text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg font-sans">
              Casamento, noivado, aniversário ou outra data especial — uma experiência
              editorial inspirada na papelaria de luxo, com RSVP em tempo real e
              check-in por QR Code.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/criar"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
              >
                Criar convite
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/convite/mariana-pedro/8Fk92KsP"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
              >
                Ver convite real
              </Link>
            </div>
            <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {FEATURES.slice(0, 4).map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-stone-600 font-sans">
                  <Check className="w-3.5 h-3.5 text-[#5E6B56] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <img
              src={coupleEditorial}
              alt="Casal de noivos"
              className="w-full h-[420px] sm:h-[520px] object-cover rounded-xs shadow-2xl"
            />
            <div className="absolute -bottom-5 -left-4 sm:left-6 bg-[#FAF7F2] border border-stone-200 px-6 py-4 shadow-xl">
              <p className="font-script text-3xl text-[#5E6B56] leading-none">Aura Nupcial</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mt-1">
                Papelaria digital de autor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 ocasiões */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">
            Para cada ocasião
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
            O que está a preparar?
          </h2>
          <p className="mt-4 text-sm text-stone-600 font-sans">
            Escolha a ocasião — adaptamos os campos e o convite em função dela.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {OCCASION_LIST.map((o) => {
            const Icon = o.icon;
            return (
              <Link
                key={o.id}
                to={`/criar?ocasiao=${o.id}`}
                className="group bg-white border border-stone-200 p-6 rounded-xs hover:border-[#5E6B56] hover:shadow-md transition-all"
              >
                <Icon className="w-6 h-6 text-[#5E6B56] mb-3" />
                <h3 className="font-serif text-xl text-stone-900">{o.label}</h3>
                <p className="text-[11px] uppercase tracking-wider text-[#5E6B56] mt-1">
                  {o.tagline}
                </p>
                <p className="text-xs text-stone-600 font-sans mt-3 leading-relaxed">
                  {o.description}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-800 group-hover:text-[#5E6B56]">
                  Começar <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">
            Como funciona
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
            Do primeiro clique ao último convite
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white border border-stone-200 p-6 rounded-xs">
              <span className="font-serif text-3xl text-[#D8DFD5]">{s.n}</span>
              <h3 className="font-serif text-lg text-stone-900 mt-2">{s.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed mt-2 font-sans">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/como-funciona"
            className="text-xs uppercase tracking-[0.2em] font-semibold text-[#5E6B56] hover:underline"
          >
            Saber mais →
          </Link>
        </div>
      </section>

      {/* Prova social / destaque */}
      <section className="bg-[#F4EFE6] border-y border-stone-200">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 text-center">
          <p className="font-serif text-2xl sm:text-3xl italic text-stone-800 leading-relaxed">
            “Cada convidado recebe um convite feito à sua medida — com o seu nome,
            escrito à mão sobre papel que parece real.”
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.3em] text-stone-500">
            A filosofia Aura Nupcial
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
          Pronto para surpreender os seus convidados?
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/criar"
            className="px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
          >
            Criar convite
          </Link>
          <Link
            to="/pacotes"
            className="px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
          >
            Ver pacotes
          </Link>
        </div>
      </section>
    </div>
  );
};
