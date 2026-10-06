import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import paperTexture from '../../assets/images/luxury_paper_texture_1791141333707.jpg';
import coupleEditorial from '../../assets/images/couple_editorial.jpg';
import { OCCASION_LIST } from '../../data/occasions';
import { SmartImage } from '../../components/motion/SmartImage';
import { Reveal, RevealItem } from '../../components/motion/Reveal';
import { DivisoriaBotanica } from '../../components/motion/DivisoriaBotanica';
import { EASE_OUT, heroChild, heroParent, quoteWord, slideChild } from '../../components/motion/variants';

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

const CITACAO =
  '“Cada convidado recebe um convite feito à sua medida — com o seu nome, escrito à mão sobre papel que parece real.”';
const PALAVRAS = CITACAO.split(' ');

export const HomePage: React.FC = () => {
  const semMovimento = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, semMovimento ? 0 : 70]);

  return (
    <div>
      {/* Hero — entrada coreografada no load */}
      <section
        ref={heroRef}
        className="relative overflow-hidden border-b border-stone-200"
        style={{
          backgroundImage: `linear-gradient(rgba(250,247,242,0.92), rgba(250,247,242,0.97)), url(${paperTexture})`,
          backgroundSize: 'cover'
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 grid gap-12 lg:grid-cols-2 items-center">
          <motion.div variants={heroParent} initial="hidden" animate="visible">
            <motion.p
              variants={heroChild}
              className="text-[11px] uppercase tracking-[0.35em] text-[#5E6B56] font-medium mb-5"
            >
              Convites digitais de autor
            </motion.p>
            <motion.h1
              variants={heroChild}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-stone-900"
            >
              O convite da sua celebração,
              <span className="block italic text-[#5E6B56]">reimaginado em digital.</span>
            </motion.h1>
            <motion.p
              variants={heroChild}
              className="mt-6 text-sm sm:text-base text-stone-600 leading-relaxed max-w-lg font-sans"
            >
              Casamento, noivado, aniversário ou outra data especial — uma experiência
              editorial inspirada na papelaria de luxo, com RSVP em tempo real e
              check-in por QR Code.
            </motion.p>
            <motion.div variants={heroChild} className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/criar"
                className="press group inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
              >
                Criar convite
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/convite/mariana-pedro/8Fk92KsP"
                className="press inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
              >
                Ver convite real
              </Link>
            </motion.div>
            <motion.ul variants={heroChild} className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {FEATURES.slice(0, 4).map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-stone-600 font-sans">
                  <Check className="w-3.5 h-3.5 text-[#5E6B56] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 1.04, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.35 }}
            >
              <motion.div style={{ y: yParallax }}>
                <SmartImage
                  src={coupleEditorial}
                  alt="Casal de noivos"
                  className="w-full h-[420px] sm:h-[520px] object-cover rounded-xs shadow-2xl"
                />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -bottom-5 -left-4 sm:left-6 bg-[#FAF7F2] border border-stone-200 px-6 py-4 shadow-xl"
            >
              <motion.div
                animate={semMovimento ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="font-script text-3xl text-[#5E6B56] leading-none">Aura Nupcial</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mt-1">
                  Papelaria digital de autor
                </p>
              </motion.div>
            </motion.div>
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
        <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {OCCASION_LIST.map((o) => {
            const Icon = o.icon;
            return (
              <RevealItem key={o.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ y: 0, transition: { duration: 0.18, ease: EASE_OUT } }}
                >
                  <Link
                    to={`/criar?ocasiao=${o.id}`}
                    className="group block bg-white border border-stone-200 p-6 rounded-xs hover:border-[#5E6B56] hover:shadow-md transition-all"
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
                      Começar
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>
              </RevealItem>
            );
          })}
        </Reveal>
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
        <Reveal stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <RevealItem key={s.n}>
              <div className="bg-white border border-stone-200 p-6 rounded-xs h-full">
                <motion.span variants={slideChild} className="block font-serif text-3xl text-[#D8DFD5]">
                  {s.n}
                </motion.span>
                <h3 className="font-serif text-lg text-stone-900 mt-2">{s.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mt-2 font-sans">{s.text}</p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
        <div className="text-center mt-10">
          <Link
            to="/como-funciona"
            className="group inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#5E6B56] hover:underline"
          >
            Saber mais
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <DivisoriaBotanica />
      </div>

      {/* Prova social / destaque — citação revelada palavra a palavra */}
      <section className="bg-[#F4EFE6] border-y border-stone-200">
        <Reveal stagger staggerGap={0.035} className="max-w-4xl mx-auto px-5 sm:px-8 py-16 text-center">
          <p className="font-serif text-2xl sm:text-3xl italic text-stone-800 leading-relaxed">
            {PALAVRAS.map((palavra, i) => (
              <motion.span
                key={`${palavra}-${i}`}
                variants={quoteWord}
                className="inline-block"
                style={i === PALAVRAS.length - 1 ? undefined : { marginRight: '0.28em' }}
              >
                {palavra}
              </motion.span>
            ))}
          </p>
          <motion.p
            variants={heroChild}
            className="mt-5 text-[11px] uppercase tracking-[0.3em] text-stone-500"
          >
            A filosofia Aura Nupcial
          </motion.p>
        </Reveal>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <DivisoriaBotanica />
      </div>

      {/* CTA final */}
      <Reveal>
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900">
            Pronto para surpreender os seus convidados?
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/criar"
              className="press px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
            >
              Criar convite
            </Link>
            <Link
              to="/pacotes"
              className="press px-7 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
            >
              Ver pacotes
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
};
