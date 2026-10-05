import React from 'react';
import { WeddingEvent, ColorPalette } from '../../types/wedding';
import { BotanicalCorner, BotanicalDivider } from '../common/BotanicalFlourish';
import { eventNames } from '../../data/occasions';

interface CoupleMessageSectionProps {
  event: WeddingEvent;
  palette: ColorPalette;
}

export const CoupleMessageSection: React.FC<CoupleMessageSectionProps> = ({
  event,
  palette
}) => {
  // Sem mensagem preenchida, a secção não aparece.
  if (!event.coupleMessage.body) return null;

  const names = eventNames(event);

  return (
    <section
      className="relative w-full py-24 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperWarm }}
    >
      <div className="absolute top-4 left-4 sm:top-10 sm:left-10">
        <BotanicalCorner position="top-left" color={palette.accent} />
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10">
        <BotanicalCorner position="bottom-right" color={palette.accent} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto w-full">
        <p
          className="text-xs uppercase tracking-[0.3em] font-sans font-medium mb-2"
          style={{ color: palette.mutedText }}
        >
          COM AMOR E GRATIDÃO
        </p>
        <h2
          className="font-serif text-3xl sm:text-4xl font-light tracking-wide mb-8"
          style={{ color: palette.primaryText }}
        >
          {event.coupleMessage.title}
        </h2>

        <BotanicalDivider color={palette.accent} className="mb-8" />

        <p
          className="font-serif italic text-base sm:text-lg leading-relaxed mb-8 px-4"
          style={{ color: palette.primaryText }}
        >
          "{event.coupleMessage.body}"
        </p>

        <div className="flex flex-col items-center mt-6">
          <p
            className="text-[11px] uppercase tracking-[0.25em] font-sans font-medium mb-2"
            style={{ color: palette.mutedText }}
          >
            {event.coupleMessage.signOff}
          </p>
          <span
            className="font-script text-4xl sm:text-5xl my-1"
            style={{ color: palette.accent }}
          >
            {names}
          </span>
        </div>
      </div>
    </section>
  );
};
