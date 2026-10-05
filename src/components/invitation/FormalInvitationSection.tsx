import React from 'react';
import { WeddingEvent, Guest, ColorPalette } from '../../types/wedding';
import { BotanicalCorner, BotanicalDivider } from '../common/BotanicalFlourish';
import { eventNames, formalPhrase, fallbackNames } from '../../data/occasions';

interface FormalInvitationSectionProps {
  event: WeddingEvent;
  guest?: Guest;
  palette: ColorPalette;
}

export const FormalInvitationSection: React.FC<FormalInvitationSectionProps> = ({
  event,
  guest,
  palette
}) => {
  const names = eventNames(event) || fallbackNames(event.occasion);

  // Saudação personalizada com as frases da ocasião do evento.
  const getGreeting = () => {
    if (!guest) {
      return {
        title: 'Estimado Convidado,',
        text: formalPhrase(event.occasion, 'none', names)
      };
    }

    if (guest.customSalutation) {
      return {
        title: guest.customSalutation,
        text: formalPhrase(event.occasion, 'individual', names)
      };
    }

    switch (guest.salutationType) {
      case 'family':
        return {
          title: `Querida ${guest.name},`,
          text: formalPhrase(event.occasion, 'family', names)
        };
      case 'couple':
        return {
          title: `Queridos ${guest.name},`,
          text: formalPhrase(event.occasion, 'couple', names)
        };
      case 'individual':
      default:
        return {
          title: `Querido(a) ${guest.name},`,
          text: formalPhrase(event.occasion, 'individual', names)
        };
    }
  };

  const greeting = getGreeting();

  // "Sexta-feira, 15 JANEIRO 2027" — dia da semana a partir do calendário.
  const weekday = event.dateIso
    ? new Date(`${event.dateIso}T12:00:00`).toLocaleDateString('pt-PT', { weekday: 'long' })
    : '';
  const dateLine = [weekday ? `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)},` : '', event.dateDisplay]
    .filter(Boolean)
    .join(' ');
  const timeLine = [
    event.ceremony.time ? `Às ${event.ceremony.time}` : '',
    event.locationDisplay
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section
      className="relative w-full py-24 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperBg }}
    >
      {/* Decorative Hairline Double Border Frame */}
      <div
        className="absolute inset-4 sm:inset-10 pointer-events-none"
        style={{ border: `1px solid ${palette.hairline}` }}
      />
      <div
        className="absolute inset-6 sm:inset-12 pointer-events-none opacity-50"
        style={{ border: `1px solid ${palette.hairline}` }}
      />

      {/* Botanical Corner Flourishes */}
      <div className="absolute top-4 left-4 sm:top-10 sm:left-10">
        <BotanicalCorner position="top-left" color={palette.accent} />
      </div>
      <div className="absolute top-4 right-4 sm:top-10 sm:right-10">
        <BotanicalCorner position="top-right" color={palette.accent} />
      </div>
      <div className="absolute bottom-4 left-4 sm:bottom-10 sm:left-10">
        <BotanicalCorner position="bottom-left" color={palette.accent} />
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10">
        <BotanicalCorner position="bottom-right" color={palette.accent} />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
        {/* Monogram Seal */}
        <div
          className="w-10 h-10 rounded-full border flex items-center justify-center mb-6"
          style={{ borderColor: palette.goldAccent, color: palette.accent }}
        >
          <span className="font-serif text-xs font-semibold tracking-widest">
            {event.monogram.replace('&', '+')}
          </span>
        </div>

        {/* Guest Personalized Callout Card */}
        <div
          className="w-full p-6 sm:p-7 mb-10 text-center rounded-xs"
          style={{
            backgroundColor: palette.paperWarm,
            border: `1px solid ${palette.hairline}`
          }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.25em] font-sans font-medium mb-1"
            style={{ color: palette.goldAccent }}
          >
            CONVITE PESSOAL & INTRANSMISSÍVEL
          </p>
          <h3
            className="font-serif text-xl sm:text-2xl font-normal my-2"
            style={{ color: palette.primaryText }}
          >
            {greeting.title}
          </h3>
          <p
            className="font-serif italic text-sm sm:text-base leading-relaxed mt-2"
            style={{ color: palette.mutedText }}
          >
            {greeting.text}
          </p>
          {guest && guest.maxGuests > 1 && (
            <p
              className="text-[11px] tracking-wider uppercase font-sans mt-3 pt-3 border-t inline-block"
              style={{ borderColor: palette.hairline, color: palette.accent }}
            >
              Válido para até {guest.maxGuests} lugares reservados
            </p>
          )}
        </div>

        {/* Honoring Parents */}
        {event.parentsHonoring && (
          <p
            className="font-serif text-xs sm:text-sm italic leading-relaxed max-w-md mx-auto mb-8 px-2"
            style={{ color: palette.mutedText }}
          >
            {event.parentsHonoring}
          </p>
        )}

        {/* Solemn Invitation Phrasing */}
        <p
          className="text-xs uppercase tracking-[0.28em] font-sans font-medium mb-6 leading-relaxed max-w-sm"
          style={{ color: palette.primaryText }}
        >
          {event.invitationIntro}
        </p>

        {/* Names — empilhados quando há duas pessoas, numa linha quando há uma */}
        <div className="my-3 flex flex-col items-center">
          {event.brideName && event.groomName ? (
            <>
              <h2
                className="font-serif text-3xl sm:text-4xl tracking-wide uppercase font-light"
                style={{ color: palette.primaryText }}
              >
                {event.brideName}
              </h2>
              <span
                className="font-script text-4xl sm:text-5xl my-1 select-none"
                style={{ color: palette.accent }}
              >
                {event.conjunction}
              </span>
              <h2
                className="font-serif text-3xl sm:text-4xl tracking-wide uppercase font-light"
                style={{ color: palette.primaryText }}
              >
                {event.groomName}
              </h2>
            </>
          ) : (
            <h2
              className="font-serif text-3xl sm:text-4xl tracking-wide uppercase font-light"
              style={{ color: palette.primaryText }}
            >
              {names}
            </h2>
          )}
        </div>

        <BotanicalDivider color={palette.accent} className="my-8" />

        {/* Date & Location Summary */}
        {dateLine && (
          <p
            className="font-serif text-lg sm:text-xl font-light tracking-wide mb-1"
            style={{ color: palette.primaryText }}
          >
            {dateLine}
          </p>
        )}
        {timeLine && (
          <p
            className="text-xs uppercase tracking-[0.25em] font-sans font-medium"
            style={{ color: palette.mutedText }}
          >
            {timeLine}
          </p>
        )}
      </div>
    </section>
  );
};
