import React from 'react';
import { WeddingEvent, ColorPalette } from '../../types/wedding';
import { BotanicalWreath, BotanicalDivider } from '../common/BotanicalFlourish';
import { eventNames } from '../../data/occasions';
import { SmartImage } from '../motion/SmartImage';

interface CoupleHeroSectionProps {
  event: WeddingEvent;
  palette: ColorPalette;
}

export const CoupleHeroSection: React.FC<CoupleHeroSectionProps> = ({
  event,
  palette
}) => {
  const names = eventNames(event);
  return (
    <section
      className="relative w-full py-20 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperWarm }}
    >
      {/* Decorative Monogram Wreath */}
      <div className="mb-6">
        <BotanicalWreath color={palette.accent} size={150}>
          <span
            className="font-serif text-3xl font-normal tracking-widest select-none"
            style={{ color: palette.accent }}
          >
            {event.monogram.replace('&', '+')}
          </span>
        </BotanicalWreath>
      </div>

      {/* Sacred Scripture / Thoughtful Verse */}
      {event.verse?.text && (
        <div className="max-w-md mx-auto mb-12 px-4">
          <p
            className="font-serif italic text-base sm:text-lg leading-relaxed mb-3"
            style={{ color: palette.primaryText }}
          >
            "{event.verse.text}"
          </p>
          {event.verse.citation && (
            <p
              className="text-[11px] uppercase tracking-[0.25em] font-sans font-medium"
              style={{ color: palette.goldAccent }}
            >
              — {event.verse.citation}
            </p>
          )}
        </div>
      )}

      {/* Editorial Portrait Arch Frame */}
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto my-4">
        {/* Outer Hairline Border */}
        <div
          className="absolute -inset-3.5 rounded-t-[140px] pointer-events-none"
          style={{ border: `1px solid ${palette.hairline}` }}
        />

        {/* Arch Container with Image */}
        <div
          className="relative overflow-hidden rounded-t-[130px] aspect-[3/4] shadow-md"
          style={{ backgroundColor: palette.paperBg }}
        >
          {event.heroPhoto ? (
            <>
              <SmartImage
                src={event.heroPhoto}
                alt={names || 'Foto do evento'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter saturate-[0.92] contrast-[1.02]"
                loading="lazy"
              />

              {/* Soft Bottom Scrim */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

              {/* Names Overlaid at Image Base */}
              <div className="absolute inset-x-0 bottom-4 px-4 text-center">
                {event.dateDisplay && (
                  <p className="text-white/80 text-[10px] tracking-[0.3em] uppercase font-sans font-medium mb-1">
                    {event.dateDisplay}
                  </p>
                )}
                <h3 className="font-script text-white text-3xl sm:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {names}
                </h3>
              </div>
            </>
          ) : (
            /* Sem foto escolhida: arco tipográfico em vez de imagem vazia. */
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <span
                className="font-serif text-4xl tracking-widest select-none"
                style={{ color: palette.accent }}
              >
                {event.monogram || names}
              </span>
              <h3 className="font-script text-3xl" style={{ color: palette.primaryText }}>
                {names}
              </h3>
              {event.dateDisplay && (
                <p
                  className="text-[10px] tracking-[0.3em] uppercase font-sans"
                  style={{ color: palette.mutedText }}
                >
                  {event.dateDisplay}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <BotanicalDivider color={palette.accent} className="mt-12" />
    </section>
  );
};
