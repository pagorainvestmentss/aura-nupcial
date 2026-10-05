import React from 'react';
import { WeddingEvent, ColorPalette } from '../../types/wedding';
import { BotanicalCorner, BotanicalDivider } from '../common/BotanicalFlourish';
import { getOccasion, isCoupleOccasion } from '../../data/occasions';

interface DeclarationsSectionProps {
  event: WeddingEvent;
  palette: ColorPalette;
}

export const DeclarationsSection: React.FC<DeclarationsSectionProps> = ({
  event,
  palette
}) => {
  const occasion = getOccasion(event.occasion);
  const hasGroom = Boolean(event.declarations.groom.quote);
  const hasBride = Boolean(event.declarations.bride.quote);

  // Sem declarações preenchidas, a secção não aparece.
  if (!hasGroom && !hasBride) return null;

  const kicker = isCoupleOccasion(event.occasion) ? 'PALAVRAS DO CORAÇÃO' : 'AS NOSSAS PALAVRAS';

  return (
    <section
      className="relative w-full py-24 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperBg }}
    >
      {/* Decorative Frame */}
      <div
        className="absolute inset-4 sm:inset-10 pointer-events-none"
        style={{ border: `1px solid ${palette.hairline}` }}
      />

      <div className="absolute top-4 left-4 sm:top-10 sm:left-10">
        <BotanicalCorner position="top-left" color={palette.accent} />
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10">
        <BotanicalCorner position="bottom-right" color={palette.accent} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto w-full">
        <p
          className="text-xs uppercase tracking-[0.3em] font-sans font-medium mb-2"
          style={{ color: palette.mutedText }}
        >
          {kicker}
        </p>
        <h2
          className="font-serif text-3xl sm:text-4xl font-light tracking-wide mb-10"
          style={{ color: palette.primaryText }}
        >
          {occasion.labels.declarationTitle}
        </h2>

        {/* Groom Declaration */}
        {hasGroom && (
        <div className="my-8 px-4 sm:px-8">
          <p
            className="font-serif italic text-lg sm:text-xl leading-relaxed text-balance"
            style={{ color: palette.primaryText }}
          >
            "{event.declarations.groom.quote}"
          </p>
          <div className="mt-4 flex flex-col items-center">
            {event.declarations.groom.author && (
              <span
                className="font-script text-3xl sm:text-4xl"
                style={{ color: palette.accent }}
              >
                — {event.declarations.groom.author}
              </span>
            )}
            <span
              className="text-[10px] uppercase tracking-[0.25em] font-sans font-medium mt-1"
              style={{ color: palette.goldAccent }}
            >
              {occasion.labels.declarationGroomRole}
            </span>
          </div>
        </div>
        )}

        {hasGroom && hasBride && (
          <BotanicalDivider color={palette.accent} className="my-10" />
        )}

        {/* Bride Declaration */}
        {hasBride && (
        <div className="my-8 px-4 sm:px-8">
          <p
            className="font-serif italic text-lg sm:text-xl leading-relaxed text-balance"
            style={{ color: palette.primaryText }}
          >
            "{event.declarations.bride.quote}"
          </p>
          <div className="mt-4 flex flex-col items-center">
            {event.declarations.bride.author && (
              <span
                className="font-script text-3xl sm:text-4xl"
                style={{ color: palette.accent }}
              >
                — {event.declarations.bride.author}
              </span>
            )}
            <span
              className="text-[10px] uppercase tracking-[0.25em] font-sans font-medium mt-1"
              style={{ color: palette.goldAccent }}
            >
              {occasion.labels.declarationBrideRole}
            </span>
          </div>
        </div>
        )}
      </div>
    </section>
  );
};
