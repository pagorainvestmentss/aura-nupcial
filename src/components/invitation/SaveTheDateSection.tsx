import React from 'react';
import { WeddingEvent, ColorPalette } from '../../types/wedding';
import { BotanicalCorner, BotanicalDivider } from '../common/BotanicalFlourish';
import { getOccasion, eventNames } from '../../data/occasions';

interface SaveTheDateSectionProps {
  event: WeddingEvent;
  palette: ColorPalette;
  onRsvpClick: () => void;
}

export const SaveTheDateSection: React.FC<SaveTheDateSectionProps> = ({
  event,
  palette,
  onRsvpClick
}) => {
  const occasion = getOccasion(event.occasion);

  // Data do convite: texto do cliente, senão calendário, senão vazio.
  const dateParts = (event.dateDisplay || '').split(' ').filter(Boolean);
  const isoParts = (event.dateIso || '').split('-');
  const day = dateParts[0] || (isoParts[2] ? String(Number(isoParts[2])) : '');
  const month = dateParts[1] || (isoParts[1] ? ['', 'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'][Number(isoParts[1])] : '');
  const year = dateParts[2] || isoParts[0] || '';
  const names = eventNames(event);

  return (
    <section
      className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden"
      style={{
        backgroundColor: palette.paperBg
      }}
    >
      {/* Delicate Double Hairline Inset Frame */}
      <div
        className="absolute inset-4 sm:inset-8 pointer-events-none"
        style={{ border: `1px solid ${palette.hairline}` }}
      />
      <div
        className="absolute inset-5 sm:inset-9 pointer-events-none opacity-60"
        style={{ border: `1px solid ${palette.hairline}` }}
      />

      {/* Corner Botanical Foliage */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <BotanicalCorner position="top-left" color={palette.accent} />
      </div>
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <BotanicalCorner position="top-right" color={palette.accent} />
      </div>
      <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8">
        <BotanicalCorner position="bottom-left" color={palette.accent} />
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8">
        <BotanicalCorner position="bottom-right" color={palette.accent} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
        {/* Monogram or Small Crest */}
        <div
          className="w-12 h-12 rounded-full border flex items-center justify-center mb-6"
          style={{ borderColor: palette.goldAccent, color: palette.accent }}
        >
          <span className="font-serif text-sm font-semibold tracking-widest">
            {event.monogram.replace('&', '+')}
          </span>
        </div>

        {/* Section Header */}
        <p
          className="text-xs sm:text-sm uppercase tracking-[0.35em] font-sans font-medium mb-3"
          style={{ color: palette.mutedText }}
        >
          {occasion.hero.kicker}
        </p>

        <h1
          className="font-serif text-base sm:text-lg tracking-[0.25em] uppercase font-light mb-8"
          style={{ color: palette.primaryText }}
        >
          {occasion.hero.title}
        </h1>

        <BotanicalDivider color={palette.accent} className="mb-8" />

        {/* Date Callout with Editorial Typography */}
        {(day || month || year) && (
          <div className="flex flex-col items-center my-2">
            <span
              className="font-serif text-6xl sm:text-7xl font-light tracking-tight"
              style={{ color: palette.primaryText }}
            >
              {day}
            </span>
            <span
              className="font-sans text-xs sm:text-sm tracking-[0.35em] uppercase font-medium mt-1"
              style={{ color: palette.accent }}
            >
              {month}
            </span>
            <span
              className="font-serif text-xl sm:text-2xl font-light tracking-widest mt-1"
              style={{ color: palette.mutedText }}
            >
              {year}
            </span>
          </div>
        )}

        <BotanicalDivider color={palette.accent} className="my-8" />

        {/* Names in Elegant Script (só quando há nomes — o título acima já cobre o resto) */}
        {names && (
          <h2
            className="font-script text-5xl sm:text-6xl my-2 leading-tight select-none"
            style={{ color: palette.accent }}
          >
            {names}
          </h2>
        )}

        {/* Location Display */}
        {event.locationDisplay && (
          <p
            className="text-xs sm:text-sm tracking-[0.3em] uppercase font-sans font-medium mt-4 mb-10"
            style={{ color: palette.mutedText }}
          >
            {event.locationDisplay}
          </p>
        )}

        {/* Action Button: Confirmar Presença */}
        <button
          onClick={onRsvpClick}
          className={`px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-sans font-semibold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer rounded-xs ${
            event.locationDisplay ? '' : 'mt-6'
          }`}
          style={{
            backgroundColor: palette.accent,
            color: '#FFFFFF'
          }}
        >
          CONFIRMAR PRESENÇA
        </button>
      </div>
    </section>
  );
};
