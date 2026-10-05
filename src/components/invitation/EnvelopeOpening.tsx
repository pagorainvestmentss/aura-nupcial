import React, { useState } from 'react';
import { WeddingEvent, Guest, ColorPalette } from '../../types/wedding';
import { BotanicalCorner, WaxSealButton } from '../common/BotanicalFlourish';
import { getOccasion, eventNames } from '../../data/occasions';

interface EnvelopeOpeningProps {
  event: WeddingEvent;
  guest?: Guest;
  palette: ColorPalette;
  onOpenComplete: () => void;
}

export const EnvelopeOpening: React.FC<EnvelopeOpeningProps> = ({
  event,
  guest,
  palette,
  onOpenComplete
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    // Smooth, premium transition (750ms)
    setTimeout(() => {
      onOpenComplete();
    }, 750);
  };

  const occasion = getOccasion(event.occasion);
  const names = eventNames(event);
  const dateLocation = [event.dateDisplay, event.locationDisplay].filter(Boolean).join(' · ');

  // Guest name display on envelope exterior
  const guestAddressee = guest
    ? guest.salutationType === 'family'
      ? `Para a ${guest.name}`
      : `Para ${guest.name}`
    : `Convite Especial`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 transition-all duration-700 ${
        isOpening ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
      style={{
        backgroundColor: palette.paperWarm,
        backgroundImage: `radial-gradient(${palette.hairline} 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }}
    >
      {/* Decorative Botanical Corners */}
      <div className="absolute top-4 left-4">
        <BotanicalCorner position="top-left" color={palette.accent} />
      </div>
      <div className="absolute top-4 right-4">
        <BotanicalCorner position="top-right" color={palette.accent} />
      </div>
      <div className="absolute bottom-4 left-4">
        <BotanicalCorner position="bottom-left" color={palette.accent} />
      </div>
      <div className="absolute bottom-4 right-4">
        <BotanicalCorner position="bottom-right" color={palette.accent} />
      </div>

      {/* Main Envelope Body */}
      <div
        className="relative w-full max-w-sm sm:max-w-md aspect-[4/3] rounded-sm transition-all duration-500 flex flex-col items-center justify-between p-6 sm:p-8"
        style={{
          backgroundColor: palette.paperBg,
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          border: `1px solid ${palette.hairline}`
        }}
      >
        {/* Subtle Double Hairline Inset */}
        <div
          className="absolute inset-2.5 sm:inset-3.5 pointer-events-none"
          style={{ border: `1px solid ${palette.hairline}` }}
        />

        {/* Top Header on Envelope */}
        <div className="relative z-10 text-center pt-2">
          <p
            className="text-[10px] tracking-[0.28em] uppercase font-sans font-medium"
            style={{ color: palette.mutedText }}
          >
            CONVITE · {occasion.label.toUpperCase()}
          </p>
          {names && (
            <h2
              className="font-script text-3xl sm:text-4xl mt-1 tracking-wide"
              style={{ color: palette.accent }}
            >
              {names}
            </h2>
          )}
        </div>

        {/* Center: Wax Seal & Interactive Trigger */}
        <div className="relative z-10 flex flex-col items-center my-auto py-2">
          <WaxSealButton
            monogram={event.monogram}
            sealColor={palette.sealColor}
            onClick={handleOpen}
          />
          <button
            onClick={handleOpen}
            className="mt-3 text-[11px] uppercase tracking-[0.22em] font-sans font-medium hover:underline cursor-pointer transition-colors"
            style={{ color: palette.primaryText }}
          >
            Toque no selo para abrir
          </button>
        </div>

        {/* Bottom: Guest Dedication */}
        <div className="relative z-10 text-center pb-2 w-full border-t pt-3" style={{ borderColor: palette.hairline }}>
          <p
            className="font-serif italic text-base sm:text-lg"
            style={{ color: palette.primaryText }}
          >
            {guestAddressee}
          </p>
          {dateLocation && (
            <p
              className="text-[10px] tracking-[0.2em] uppercase font-sans mt-0.5"
              style={{ color: palette.mutedText }}
            >
              {dateLocation}
            </p>
          )}
        </div>
      </div>

      {/* Discrete bypass link */}
      <button
        onClick={onOpenComplete}
        className="mt-6 text-xs text-stone-400 hover:text-stone-600 underline font-sans tracking-wide transition-colors cursor-pointer"
      >
        Pular abertura e ver convite direto
      </button>
    </div>
  );
};
