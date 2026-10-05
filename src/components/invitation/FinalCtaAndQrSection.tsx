import React, { useEffect, useState } from 'react';
import { WeddingEvent, Guest, ColorPalette } from '../../types/wedding';
import { BotanicalWreath, BotanicalDivider } from '../common/BotanicalFlourish';
import QRCode from 'qrcode';
import { QrCode, CheckCircle2, AlertCircle } from 'lucide-react';

interface FinalCtaAndQrSectionProps {
  event: WeddingEvent;
  guest?: Guest;
  palette: ColorPalette;
  onRsvpClick: () => void;
}

export const FinalCtaAndQrSection: React.FC<FinalCtaAndQrSectionProps> = ({
  event,
  guest,
  palette,
  onRsvpClick
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (guest?.token) {
      // Encode individual invitation URL or check-in payload into the QR Code
      const verificationUrl = `${window.location.origin}/convite/${event.slug}/${guest.token}`;
      QRCode.toDataURL(verificationUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: palette.primaryText,
          light: '#00000000' // transparent background
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [guest?.token, event.slug, palette.primaryText]);

  const isConfirmed = guest?.rsvpStatus === 'confirmed';

  return (
    <section
      className="relative w-full py-24 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperBg }}
    >
      <div className="max-w-md mx-auto w-full flex flex-col items-center">
        {/* Monogram Wreath */}
        <BotanicalWreath color={palette.accent} size={130} className="mb-6">
          <span
            className="font-serif text-2xl font-light tracking-widest"
            style={{ color: palette.accent }}
          >
            {event.monogram.replace('&', '+')}
          </span>
        </BotanicalWreath>

        <h3
          className="font-serif text-2xl sm:text-3xl font-light tracking-wide mb-3"
          style={{ color: palette.primaryText }}
        >
          Contamos consigo neste dia tão especial.
        </h3>

        <p
          className="font-serif italic text-sm mb-8"
          style={{ color: palette.mutedText }}
        >
          {[event.dateDisplay, event.locationDisplay].filter(Boolean).join(' · ')}
        </p>

        {/* Dynamic CTA Button */}
        {isConfirmed ? (
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xs text-xs uppercase tracking-[0.2em] font-sans font-semibold mb-12 shadow-xs"
            style={{
              backgroundColor: palette.paperWarm,
              color: palette.accent,
              border: `1px solid ${palette.goldAccent}`
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>PRESENÇA CONFIRMADA ✓</span>
          </div>
        ) : (
          <button
            onClick={onRsvpClick}
            className="px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-sans font-semibold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer rounded-xs mb-12"
            style={{
              backgroundColor: palette.accent,
              color: '#FFFFFF'
            }}
          >
            CONFIRMAR PRESENÇA
          </button>
        )}

        <BotanicalDivider color={palette.accent} className="mb-12" />

        {/* Individual QR Code Check-in Card (Pro Feature) */}
        {event.enableQrValidation && guest && (
          <div
            className="w-full p-6 sm:p-8 rounded-xs text-center relative overflow-hidden"
            style={{
              backgroundColor: palette.paperWarm,
              border: `1px solid ${palette.hairline}`
            }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <QrCode className="w-4 h-4" style={{ color: palette.goldAccent }} />
              <p
                className="text-[10px] uppercase tracking-[0.25em] font-sans font-semibold"
                style={{ color: palette.goldAccent }}
              >
                CHECK-IN INDIVIDUAL NO EVENTO
              </p>
            </div>

            <h4
              className="font-serif text-lg font-medium mb-1"
              style={{ color: palette.primaryText }}
            >
              Passe de Acesso: {guest.name}
            </h4>

            <p
              className="text-xs font-sans mb-4"
              style={{ color: palette.mutedText }}
            >
              Apresente este código à equipa de recepção no dia da celebração.
            </p>

            {/* QR Code Container */}
            <div
              className="w-44 h-44 mx-auto p-3 rounded-xs flex items-center justify-center bg-white shadow-xs mb-3"
              style={{ border: `1px solid ${palette.hairline}` }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code de ${guest.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="animate-pulse text-xs text-stone-400 font-sans">
                  A carregar passe...
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="inline-flex items-center gap-1.5 text-xs font-sans">
              {guest.qrStatus === 'used' ? (
                <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Convite já validado na recepção
                </span>
              ) : guest.qrStatus === 'revoked' ? (
                <span className="text-red-700 font-medium">
                  Convite Revogado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Passe Individual Válido · Token: {guest.token}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer Copyright and Craftsmanship note */}
        <div className="mt-16 text-center">
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-sans font-light"
            style={{ color: palette.mutedText }}
          >
            Aura Nupcial · Papelaria Editorial & Convites Digitais de Alta Costura
          </p>
        </div>
      </div>
    </section>
  );
};
