import React from 'react';
import { WeddingEvent, ColorPalette } from '../../types/wedding';
import { BotanicalDivider } from '../common/BotanicalFlourish';
import { MapPin, Navigation, Church, GlassWater } from 'lucide-react';
import { getOccasion, isCoupleOccasion } from '../../data/occasions';

interface LocationsSectionProps {
  event: WeddingEvent;
  palette: ColorPalette;
}

export const LocationsSection: React.FC<LocationsSectionProps> = ({
  event,
  palette
}) => {
  const occasion = getOccasion(event.occasion);
  const ceremonyTitle = event.ceremony.title || occasion.defaults.ceremonyTitle;
  const receptionTitle = event.reception.title || occasion.defaults.receptionTitle;
  const hasCeremony = Boolean(event.ceremony.venue);
  const hasReception = Boolean(event.reception.venue);

  // Sem locais preenchidos, a secção não aparece.
  if (!hasCeremony && !hasReception) return null;

  // Ícone religioso só para casamento/noivado — nos outros, marcador neutro.
  const CeremonyIcon = isCoupleOccasion(event.occasion) ? Church : MapPin;

  return (
    <section
      className="relative w-full py-20 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperWarm }}
    >
      <div className="max-w-xl mx-auto w-full">
        {/* Section Heading */}
        <p
          className="text-xs uppercase tracking-[0.3em] font-sans font-medium mb-2"
          style={{ color: palette.mutedText }}
        >
          ONDE E QUANDO
        </p>
        <h2
          className="font-serif text-3xl sm:text-4xl font-light tracking-wide mb-6"
          style={{ color: palette.primaryText }}
        >
          {ceremonyTitle} & {receptionTitle}
        </h2>

        <BotanicalDivider color={palette.accent} className="mb-12" />

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          {/* Ceremony Card */}
          {hasCeremony && (
          <div
            className="p-8 rounded-xs flex flex-col items-center justify-between transition-all duration-300 hover:shadow-md"
            style={{
              backgroundColor: palette.paperBg,
              border: `1px solid ${palette.hairline}`
            }}
          >
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: palette.paperWarm,
                  color: palette.accent,
                  border: `1px solid ${palette.hairline}`
                }}
              >
                <CeremonyIcon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <p
                className="text-[11px] uppercase tracking-[0.25em] font-sans font-semibold mb-1"
                style={{ color: palette.goldAccent }}
              >
                {ceremonyTitle.toUpperCase()}
              </p>
              <h3
                className="font-serif text-xl sm:text-2xl font-normal my-2"
                style={{ color: palette.primaryText }}
              >
                {event.ceremony.venue}
              </h3>
              {event.ceremony.time && (
                <p
                  className="font-serif text-lg font-light mb-3"
                  style={{ color: palette.accent }}
                >
                  {event.ceremony.time}
                </p>
              )}
              {event.ceremony.address && (
                <p
                  className="text-xs font-sans leading-relaxed max-w-xs mb-6"
                  style={{ color: palette.mutedText }}
                >
                  {event.ceremony.address}
                </p>
              )}
            </div>

            {event.ceremony.mapsUrl && (
              <a
                href={event.ceremony.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs text-[11px] uppercase tracking-[0.2em] font-sans font-medium transition-all duration-300 hover:opacity-90"
                style={{
                  backgroundColor: palette.accent,
                  color: '#FFFFFF'
                }}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Ver no Google Maps</span>
              </a>
            )}
          </div>
          )}

          {/* Reception Card */}
          {hasReception && (
          <div
            className="p-8 rounded-xs flex flex-col items-center justify-between transition-all duration-300 hover:shadow-md"
            style={{
              backgroundColor: palette.paperBg,
              border: `1px solid ${palette.hairline}`
            }}
          >
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{
                  backgroundColor: palette.paperWarm,
                  color: palette.accent,
                  border: `1px solid ${palette.hairline}`
                }}
              >
                <GlassWater className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <p
                className="text-[11px] uppercase tracking-[0.25em] font-sans font-semibold mb-1"
                style={{ color: palette.goldAccent }}
              >
                {receptionTitle.toUpperCase()}
              </p>
              <h3
                className="font-serif text-xl sm:text-2xl font-normal my-2"
                style={{ color: palette.primaryText }}
              >
                {event.reception.venue}
              </h3>
              {event.reception.time && (
                <p
                  className="font-serif text-lg font-light mb-3"
                  style={{ color: palette.accent }}
                >
                  {event.reception.time}
                </p>
              )}
              {event.reception.address && (
                <p
                  className="text-xs font-sans leading-relaxed max-w-xs mb-6"
                  style={{ color: palette.mutedText }}
                >
                  {event.reception.address}
                </p>
              )}
            </div>

            {event.reception.mapsUrl && (
              <a
                href={event.reception.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xs text-[11px] uppercase tracking-[0.2em] font-sans font-medium transition-all duration-300 hover:opacity-90"
                style={{
                  backgroundColor: palette.accent,
                  color: '#FFFFFF'
                }}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Ver no Google Maps</span>
              </a>
            )}
          </div>
          )}
        </div>
      </div>
    </section>
  );
};
