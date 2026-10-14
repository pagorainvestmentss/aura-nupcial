import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { WeddingEvent, Guest, ColorPalette } from '../../types/wedding';
import { COLOR_PALETTES } from '../../data/palettes';
import { eventNames, formalPhrase, fallbackNames, displayMonogram } from '../../data/occasions';
import { BotanicalCorner, BotanicalDivider, BotanicalWreath } from '../common/BotanicalFlourish';

interface PrintCardProps {
  event: WeddingEvent;
  guest: Guest;
}

/**
 * CARTÃO DE IMPRESSÃO (A5 retrato, 148×210 mm) — /convite/:slug/:token/imprimir
 *
 * Uma página estática, sem envelope, sem música, sem botões. O bloco RSVP
 * adapta-se ao estado do convidado:
 *  - confirmed → carimbo "Presença confirmada" + data, lugares e acompanhantes
 *  - pending   → "Aguardamos a sua resposta até {prazo}" + QR pessoal
 *  - declined  → só o convite formal
 *
 * O QR de check-in aparece no rodapé quando o evento tem validação QR activa.
 */
export const PrintCard: React.FC<PrintCardProps> = ({ event, guest }) => {
  const palette: ColorPalette = COLOR_PALETTES[event.paletteId] || COLOR_PALETTES.sage;
  const [qrDataUrl, setQrDataUrl] = useState('');

  const inviteUrl = `${window.location.origin}${import.meta.env.BASE_URL}convite/${event.slug}/${guest.token}`;

  useEffect(() => {
    QRCode.toDataURL(inviteUrl, {
      width: 200,
      margin: 1,
      color: { dark: palette.primaryText, light: '#FFFFFF' }
    })
      .then(setQrDataUrl)
      .catch((err) => console.error('Erro ao gerar QR:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteUrl]);

  const names = eventNames(event) || fallbackNames(event.occasion);

  // Ocasião aniversário: a idade acompanha o nome também no cartão impresso.
  const idade =
    event.occasion === 'aniversario' && typeof event.age === 'number' && event.age > 0
      ? Math.round(event.age)
      : null;

  // Saudação personalizada — mesma lógica do convite digital.
  const getGreeting = () => {
    if (guest.customSalutation) return guest.customSalutation;
    switch (guest.salutationType) {
      case 'family':
        return `Querida ${guest.name},`;
      case 'couple':
        return `Queridos ${guest.name},`;
      case 'individual':
      default:
        return `Querido(a) ${guest.name},`;
    }
  };

  const phraseKey = guest.customSalutation
    ? 'individual'
    : guest.salutationType === 'custom'
      ? 'individual'
      : guest.salutationType;
  const greetingText = formalPhrase(event.occasion, phraseKey, names);

  const weekday = event.dateIso
    ? new Date(`${event.dateIso}T12:00:00`).toLocaleDateString('pt-PT', { weekday: 'long' })
    : '';
  const dateLine = [weekday ? `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)},` : '', event.dateDisplay]
    .filter(Boolean)
    .join(' ');

  const companions = (guest.companions || []).filter((c) => c.trim());
  const isConfirmed = guest.rsvpStatus === 'confirmed';
  const isPending = guest.rsvpStatus === 'pending';
  const isDeclined = guest.rsvpStatus === 'declined';

  const rsvpDateLabel = guest.rsvpDate
    ? new Date(guest.rsvpDate).toLocaleDateString('pt-PT')
    : '';
  const deadlineLabel = event.rsvpDeadline
    ? new Date(`${event.rsvpDeadline}T12:00:00`).toLocaleDateString('pt-PT')
    : '';

  return (
    <article
      className="print-card relative bg-[#FAF7F2] overflow-hidden"
      style={{ backgroundColor: palette.paperBg, color: palette.primaryText }}
    >
      {/* Moldura dupla + cantos botânicos */}
      <div
        className="absolute pointer-events-none"
        style={{ inset: '10mm', border: `1px solid ${palette.hairline}` }}
      />
      <div
        className="absolute pointer-events-none opacity-50"
        style={{ inset: '13mm', border: `1px solid ${palette.hairline}` }}
      />
      <div className="absolute" style={{ top: '8mm', left: '8mm' }}>
        <BotanicalCorner position="top-left" color={palette.accent} />
      </div>
      <div className="absolute" style={{ top: '8mm', right: '8mm' }}>
        <BotanicalCorner position="top-right" color={palette.accent} />
      </div>
      <div className="absolute" style={{ bottom: '8mm', left: '8mm' }}>
        <BotanicalCorner position="bottom-left" color={palette.accent} />
      </div>
      <div className="absolute" style={{ bottom: '8mm', right: '8mm' }}>
        <BotanicalCorner position="bottom-right" color={palette.accent} />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 h-full flex flex-col items-center text-center" style={{ padding: '22mm 16mm 16mm' }}>
        {/* Selo / monograma */}
        <BotanicalWreath color={palette.accent} size={72} className="mb-3">
          <span className="font-serif text-sm font-semibold tracking-widest" style={{ color: palette.accent }}>
            {displayMonogram(event)}
          </span>
        </BotanicalWreath>

        <p
          className="text-[8px] uppercase tracking-[0.25em] font-sans font-medium"
          style={{ color: palette.goldAccent }}
        >
          Convite pessoal &amp; intransmissível
        </p>

        {/* Saudação personalizada */}
        <h3 className="font-serif text-lg font-normal my-2" style={{ color: palette.primaryText }}>
          {getGreeting()}
        </h3>
        <p className="font-serif italic text-[10px] leading-relaxed max-w-[90mm] mx-auto" style={{ color: palette.mutedText }}>
          {greetingText}
        </p>

        {guest.maxGuests > 1 && (
          <p
            className="text-[7px] tracking-wider uppercase font-sans mt-1.5"
            style={{ color: palette.accent }}
          >
            Válido para até {guest.maxGuests} lugares reservados
          </p>
        )}

        {event.parentsHonoring && (
          <p className="font-serif italic text-[9px] leading-relaxed max-w-[85mm] mx-auto mt-3" style={{ color: palette.mutedText }}>
            {event.parentsHonoring}
          </p>
        )}

        <p
          className="text-[8px] uppercase tracking-[0.22em] font-sans font-medium mt-3 leading-relaxed max-w-[80mm]"
          style={{ color: palette.primaryText }}
        >
          {event.invitationIntro}
        </p>

        {/* Nomes */}
        <div className="my-2 flex flex-col items-center">
          {event.brideName && event.groomName ? (
            <>
              <h2 className="font-serif text-[22px] tracking-wide uppercase font-light" style={{ color: palette.primaryText }}>
                {event.brideName}
              </h2>
              <span className="font-script text-[24px] my-0.5 select-none" style={{ color: palette.accent }}>
                {event.conjunction}
              </span>
              <h2 className="font-serif text-[22px] tracking-wide uppercase font-light" style={{ color: palette.primaryText }}>
                {event.groomName}
              </h2>
            </>
          ) : (
            <h2 className="font-serif text-[22px] tracking-wide uppercase font-light" style={{ color: palette.primaryText }}>
              {names}
            </h2>
          )}
        </div>

        <BotanicalDivider color={palette.accent} className="my-2" />

        {idade && (
          <p
            className="font-serif text-[13px] tracking-[0.2em] uppercase -mt-1 mb-1"
            style={{ color: palette.accent }}
          >
            {idade} anos
          </p>
        )}

        {/* Data e locais */}
        {dateLine && (
          <p className="font-serif text-[13px] font-light tracking-wide" style={{ color: palette.primaryText }}>
            {dateLine}
          </p>
        )}

        <div className="mt-2 space-y-1.5 w-full max-w-[95mm]">
          {event.ceremony.venue && (
            <div>
              <p className="text-[7px] uppercase tracking-[0.2em] font-sans font-semibold" style={{ color: palette.goldAccent }}>
                {event.ceremony.title || 'Cerimónia'}
                {event.ceremony.time ? ` · ${event.ceremony.time}` : ''}
              </p>
              <p className="font-serif text-[10px]" style={{ color: palette.primaryText }}>
                {event.ceremony.venue}
              </p>
              {event.ceremony.address && (
                <p className="font-sans text-[8px]" style={{ color: palette.mutedText }}>
                  {event.ceremony.address}
                </p>
              )}
            </div>
          )}
          {event.reception.venue && (
            <div>
              <p className="text-[7px] uppercase tracking-[0.2em] font-sans font-semibold" style={{ color: palette.goldAccent }}>
                {event.reception.title || 'Recepção'}
                {event.reception.time ? ` · ${event.reception.time}` : ''}
              </p>
              <p className="font-serif text-[10px]" style={{ color: palette.primaryText }}>
                {event.reception.venue}
              </p>
              {event.reception.address && (
                <p className="font-sans text-[8px]" style={{ color: palette.mutedText }}>
                  {event.reception.address}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Verso */}
        {event.verse.text && (
          <div className="mt-3 max-w-[90mm]">
            <p className="font-serif italic text-[9px] leading-relaxed" style={{ color: palette.mutedText }}>
              {event.verse.text}
            </p>
            {event.verse.citation && (
              <p className="text-[7px] tracking-widest font-sans mt-1" style={{ color: palette.goldAccent }}>
                {event.verse.citation}
              </p>
            )}
          </div>
        )}

        {/* Espaçador flexível — empurra o bloco RSVP e o QR para baixo */}
        <div className="flex-1" />

        {/* Bloco RSVP */}
        {isConfirmed && (
          <div
            className="mt-3 w-full max-w-[95mm] py-2.5 px-4"
            style={{ border: `1px solid ${palette.hairline}`, backgroundColor: palette.paperWarm }}
          >
            <p className="text-[8px] uppercase tracking-[0.25em] font-sans font-semibold" style={{ color: palette.accent }}>
              Presença confirmada
            </p>
            <p className="font-serif text-[11px] mt-1" style={{ color: palette.primaryText }}>
              {guest.name}
              {guest.confirmedGuests > 1 ? ` · ${guest.confirmedGuests} pessoas` : ''}
            </p>
            {companions.length > 0 && (
              <p className="font-sans text-[8px] mt-0.5" style={{ color: palette.mutedText }}>
                Com: {companions.join(', ')}
              </p>
            )}
            {!!guest.group && (
              <p className="text-[7px] uppercase tracking-wider font-sans mt-0.5" style={{ color: palette.mutedText }}>
                {guest.group}
              </p>
            )}
            {rsvpDateLabel && (
              <p className="font-sans text-[7px] mt-0.5" style={{ color: palette.mutedText }}>
                Resposta registada em {rsvpDateLabel}
              </p>
            )}
          </div>
        )}

        {isPending && (
          <div
            className="mt-3 w-full max-w-[95mm] py-2.5 px-4"
            style={{ border: `1px solid ${palette.hairline}`, backgroundColor: palette.paperWarm }}
          >
            <p className="text-[8px] uppercase tracking-[0.25em] font-sans font-semibold" style={{ color: palette.accent }}>
              Aguardamos a sua resposta
            </p>
            {deadlineLabel && (
              <p className="font-serif italic text-[9px] mt-1" style={{ color: palette.mutedText }}>
                Responda até {deadlineLabel} — escaneie o QR ou abra o link do convite.
              </p>
            )}
          </div>
        )}

        {isDeclined && (
          <div
            className="mt-3 w-full max-w-[95mm] py-2 px-4"
            style={{ border: `1px solid ${palette.hairline}` }}
          >
            <p className="font-serif italic text-[9px]" style={{ color: palette.mutedText }}>
              Obrigado por nos avisar. Sentiremos a sua falta neste dia.
            </p>
          </div>
        )}

        {/* QR de check-in / acesso */}
        {qrDataUrl && (
          <div className="mt-3 flex flex-col items-center">
            <img
              src={qrDataUrl}
              alt="QR do convite"
              width={56}
              height={56}
              style={{ width: '14mm', height: '14mm' }}
            />
            <p className="text-[6px] uppercase tracking-[0.2em] font-sans mt-1" style={{ color: palette.mutedText }}>
              {event.enableQrValidation ? 'Check-in no dia do evento' : 'Abra o convite digital'}
            </p>
          </div>
        )}

        {event.locationDisplay && (
          <p className="text-[7px] uppercase tracking-[0.25em] font-sans mt-2" style={{ color: palette.mutedText }}>
            {event.locationDisplay}
          </p>
        )}
      </div>
    </article>
  );
};
