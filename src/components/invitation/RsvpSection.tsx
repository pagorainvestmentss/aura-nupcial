import React, { useEffect, useState } from 'react';
import { WeddingEvent, Guest, ColorPalette, RsvpStatus } from '../../types/wedding';
import { WeddingStorageService } from '../../services/weddingStorage';
import { BotanicalCorner, BotanicalDivider } from '../common/BotanicalFlourish';
import { Check, X, Users, Utensils, HeartHandshake, UserPlus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getOccasion, eventNames } from '../../data/occasions';

interface RsvpSectionProps {
  event: WeddingEvent;
  guest?: Guest;
  palette: ColorPalette;
  onRsvpSuccess: (updatedGuest: Guest) => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  event,
  guest,
  palette,
  onRsvpSuccess
}) => {
  const [status, setStatus] = useState<RsvpStatus>(guest?.rsvpStatus || 'pending');
  const [companions, setCompanions] = useState<string[]>(() => {
    if (guest?.companions) return guest.companions;
    // Respostas antigas sem nomes guardados: preserva os lugares já confirmados
    const extraSeats = (guest?.confirmedGuests || 1) - 1;
    if (guest?.rsvpStatus === 'confirmed' && extraSeats > 0) {
      return Array.from({ length: extraSeats }, () => '');
    }
    return [];
  });
  const [group, setGroup] = useState<string>(guest?.group || '');
  const [notes, setNotes] = useState<string>(guest?.rsvpNotes || '');
  const [dietary, setDietary] = useState<string>(guest?.dietaryRestrictions || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(guest?.rsvpStatus === 'confirmed' || guest?.rsvpStatus === 'declined');
  const [now, setNow] = useState<number>(() => Date.now());

  const maxSeats = guest?.maxGuests || 1;
  const seatCount = 1 + companions.length;
  const occasion = getOccasion(event.occasion);
  const groupOptions = occasion.labels.groupOptions || [];
  const names = eventNames(event);
  const deadline = new Date(event.rsvpDeadline);
  const deadlineText = isNaN(deadline.getTime())
    ? ''
    : deadline.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });

  // Contagem decrescente viva: conta para o prazo de resposta e, depois,
  // para o dia do evento. Se já passou tudo, não mostra nada.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const countdownMs = (() => {
    const rsvpEnd = new Date(`${event.rsvpDeadline}T23:59:59`);
    if (!isNaN(rsvpEnd.getTime()) && rsvpEnd.getTime() > now) return rsvpEnd.getTime() - now;
    const eventDay = new Date(`${event.dateIso}T00:00:00`);
    if (!isNaN(eventDay.getTime()) && eventDay.getTime() > now) return eventDay.getTime() - now;
    return null;
  })();
  const countdownUnits =
    countdownMs === null
      ? []
      : [
          { value: Math.floor(countdownMs / 86400000), label: 'Dias' },
          { value: Math.floor((countdownMs % 86400000) / 3600000), label: 'Horas' },
          { value: Math.floor((countdownMs % 3600000) / 60000), label: 'Min' },
          { value: Math.floor((countdownMs % 60000) / 1000), label: 'Seg' }
        ];

  const handleSubmit = (chosenStatus: RsvpStatus) => {
    if (!guest) return;
    setIsSubmitting(true);

    const actualConfirmedCount = chosenStatus === 'confirmed' ? Math.max(1, seatCount) : 0;

    const result = WeddingStorageService.updateRsvp({
      guestId: guest.id,
      rsvpStatus: chosenStatus,
      confirmedGuests: actualConfirmedCount,
      notes,
      dietaryRestrictions: dietary,
      companions: companions.map((c) => c.trim()),
      group: groupOptions.length > 0 ? group : ''
    });

    setIsSubmitting(false);

    if (result.success && result.guest) {
      setStatus(chosenStatus);
      setSubmitted(true);
      onRsvpSuccess(result.guest);

      if (chosenStatus === 'confirmed') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: [palette.accent, palette.goldAccent, '#D8DFD5']
        });
      }
    }
  };

  const handleEdit = () => {
    setSubmitted(false);
  };

  return (
    <section
      id="rsvp-section"
      className="relative w-full py-24 px-6 flex flex-col items-center text-center overflow-hidden"
      style={{ backgroundColor: palette.paperBg }}
    >
      {/* Decorative Hairline Double Border Frame */}
      <div
        className="absolute inset-4 sm:inset-10 pointer-events-none"
        style={{ border: `1px solid ${palette.hairline}` }}
      />

      {/* Botanical Corners */}
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

      <div className="relative z-10 max-w-lg mx-auto w-full">
        <p
          className="text-xs uppercase tracking-[0.3em] font-sans font-medium mb-2"
          style={{ color: palette.mutedText }}
        >
          CONFIRMAÇÃO DE PRESENÇA
        </p>
        <h2
          className="font-serif text-3xl sm:text-4xl font-light tracking-wide mb-3"
          style={{ color: palette.primaryText }}
        >
          Poderemos contar consigo?
        </h2>

        <p
          className="font-serif italic text-sm sm:text-base max-w-md mx-auto mb-6"
          style={{ color: palette.mutedText }}
        >
          {deadlineText
            ? `Pedimos a gentileza de responder até ${deadlineText} para a perfeita organização.`
            : 'Pedimos a gentileza de responder com a maior antecedência possível para a perfeita organização.'}
        </p>

        {countdownUnits.length > 0 && (
          <div
            className="flex justify-center gap-3 sm:gap-4 mb-2"
            aria-label="Contagem decrescente para o prazo de resposta"
          >
            {countdownUnits.map((unit) => (
              <div
                key={unit.label}
                className="min-w-[3.4rem] px-2 py-2.5 rounded-xs"
                style={{ border: `1px solid ${palette.hairline}`, backgroundColor: palette.paperWarm }}
              >
                <p className="font-serif text-2xl leading-none" style={{ color: palette.primaryText }}>
                  {String(unit.value).padStart(2, '0')}
                </p>
                <p
                  className="text-[10px] uppercase tracking-[0.2em] mt-1.5 font-sans"
                  style={{ color: palette.mutedText }}
                >
                  {unit.label}
                </p>
              </div>
            ))}
          </div>
        )}

        <BotanicalDivider color={palette.accent} className="mb-10" />

        {submitted ? (
          /* Confirmation Success Card */
          <div
            className="p-8 rounded-xs transition-all duration-500 animate-fadeIn"
            style={{
              backgroundColor: palette.paperWarm,
              border: `1px solid ${palette.hairline}`
            }}
          >
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                backgroundColor: status === 'confirmed' ? palette.accent : '#8C4830',
                color: '#FFFFFF'
              }}
            >
              {status === 'confirmed' ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
            </div>

            <h3
              className="font-serif text-2xl font-normal mb-2"
              style={{ color: palette.primaryText }}
            >
              {status === 'confirmed' ? 'Presença Confirmada' : 'Agradecemos a sua resposta'}
            </h3>

            <p
              className="font-serif italic text-base leading-relaxed mb-6"
              style={{ color: palette.mutedText }}
            >
              {status === 'confirmed' ? (
                <>
                  Obrigado, <strong className="font-semibold text-stone-900">{guest?.name || 'estimado convidado'}</strong>. A sua presença e o seu carinho tornarão este dia ainda mais inesquecível!
                  {seatCount > 1 && (
                    <span className="block mt-2 text-xs uppercase tracking-wider font-sans text-stone-600">
                      Lugares confirmados: {seatCount} pessoas
                    </span>
                  )}
                  {companions.some((c) => c.trim()) && (
                    <span className="block mt-1 text-xs font-sans text-stone-500">
                      Com: {companions.filter((c) => c.trim()).join(', ')}
                    </span>
                  )}
                  {group && (
                    <span className="block mt-1 text-xs uppercase tracking-wider font-sans text-stone-500">
                      {group}
                    </span>
                  )}
                </>
              ) : (
                <>
                  Sentiremos muito a sua falta, <strong className="font-semibold text-stone-900">{guest?.name}</strong>. Obrigado pelo carinho de nos ter avisado com antecedência.
                </>
              )}
            </p>

            <button
              onClick={handleEdit}
              className="text-xs uppercase tracking-widest font-sans underline hover:text-stone-900 transition-colors cursor-pointer"
              style={{ color: palette.accent }}
            >
              Alterar minha resposta
            </button>
          </div>
        ) : (
          /* Interactive RSVP Form */
          <div
            className="p-6 sm:p-8 rounded-xs text-left"
            style={{
              backgroundColor: palette.paperWarm,
              border: `1px solid ${palette.hairline}`
            }}
          >
            {guest && (
              <div className="pb-4 mb-6 border-b" style={{ borderColor: palette.hairline }}>
                <p className="text-[11px] uppercase tracking-wider font-sans font-medium" style={{ color: palette.goldAccent }}>
                  CONVIDADO IDENTIFICADO
                </p>
                <p className="font-serif text-lg font-medium" style={{ color: palette.primaryText }}>
                  {guest.name}
                </p>
                <p className="text-xs font-sans text-stone-500">
                  Reserva para até {maxSeats} {maxSeats === 1 ? 'pessoa' : 'pessoas'}
                </p>
              </div>
            )}

            {/* Grupo — só quando a ocasião define opções (ex.: Noiva / Noivo) */}
            {groupOptions.length > 0 && (
              <div className="pb-4 mb-5 border-b" style={{ borderColor: palette.hairline }}>
                <p
                  className="text-xs uppercase tracking-wider font-sans font-medium mb-2.5"
                  style={{ color: palette.primaryText }}
                >
                  {occasion.labels.groupSection}
                </p>
                <div className="flex flex-wrap gap-5">
                  {groupOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 text-sm font-sans cursor-pointer"
                      style={{ color: palette.mutedText }}
                    >
                      <input
                        type="radio"
                        name="rsvp-group"
                        value={option}
                        checked={group === option}
                        onChange={() => setGroup(option)}
                        className="cursor-pointer"
                        style={{ accentColor: palette.accent }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Acompanhantes nomeados — cada nome é um lugar extra, até à cota */}
            {maxSeats > 1 && (
              <div className="pb-4 mb-5 border-b" style={{ borderColor: palette.hairline }}>
                <div className="flex items-center justify-between mb-2.5">
                  <p
                    className="text-xs uppercase tracking-wider font-sans font-medium inline-flex items-center gap-2"
                    style={{ color: palette.primaryText }}
                  >
                    <Users className="w-3.5 h-3.5" style={{ color: palette.accent }} />
                    Acompanhantes
                  </p>
                  <span className="text-[11px] font-sans" style={{ color: palette.mutedText }}>
                    {seatCount}/{maxSeats} pessoas
                  </span>
                </div>
                <div className="space-y-2">
                  {companions.map((name, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                          setCompanions(companions.map((c, i) => (i === index ? e.target.value : c)))
                        }
                        placeholder={`Nome do acompanhante ${index + 1}`}
                        className="flex-1 py-2 px-3 text-sm font-sans bg-white border rounded-xs focus:outline-none"
                        style={{ borderColor: palette.hairline }}
                      />
                      <button
                        type="button"
                        onClick={() => setCompanions(companions.filter((_, i) => i !== index))}
                        aria-label={`Remover acompanhante ${index + 1}`}
                        className="px-2.5 border rounded-xs cursor-pointer transition-colors hover:bg-stone-100"
                        style={{ borderColor: palette.hairline, color: palette.mutedText }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {seatCount < maxSeats ? (
                    <button
                      type="button"
                      onClick={() => setCompanions([...companions, ''])}
                      className="inline-flex items-center gap-1.5 text-xs font-sans font-medium underline-offset-2 hover:underline cursor-pointer"
                      style={{ color: palette.accent }}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Adicionar acompanhante
                    </button>
                  ) : (
                    <p className="text-[11px] font-sans" style={{ color: palette.mutedText }}>
                      Limite de {maxSeats} pessoas atingido.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Attendance Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => handleSubmit('confirmed')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xs text-xs uppercase tracking-widest font-sans font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: palette.accent,
                  color: '#FFFFFF'
                }}
              >
                <Check className="w-4 h-4" />
                <span>Sim, Estarei Presente</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('declined')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xs text-xs uppercase tracking-widest font-sans font-medium transition-all duration-200 cursor-pointer border hover:bg-stone-100"
                style={{
                  borderColor: palette.hairline,
                  color: palette.mutedText,
                  backgroundColor: palette.paperBg
                }}
              >
                <X className="w-4 h-4" />
                <span>Infelizmente Não Poderei</span>
              </button>
            </div>

            {/* Additional Options: dietary restrictions & message */}
            <div className="space-y-4 pt-2 border-t" style={{ borderColor: palette.hairline }}>
              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-medium mb-1.5" style={{ color: palette.primaryText }}>
                  <Utensils className="w-3.5 h-3.5" style={{ color: palette.accent }} />
                  <span>Restrições Alimentares / Alergias (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  placeholder="Ex: Vegetariano, celíaco, alergia a marisco..."
                  className="w-full py-2 px-3 text-sm font-sans bg-white border rounded-xs focus:outline-none"
                  style={{ borderColor: palette.hairline }}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs uppercase tracking-wider font-sans font-medium mb-1.5" style={{ color: palette.primaryText }}>
                  <HeartHandshake className="w-3.5 h-3.5" style={{ color: palette.accent }} />
                  <span>{occasion.labels.rsvpMessageLabel} (Opcional)</span>
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Deixe uma palavra de carinho${names ? ` para ${names}` : ''}...`}
                  className="w-full py-2 px-3 text-sm font-sans bg-white border rounded-xs focus:outline-none resize-none"
                  style={{ borderColor: palette.hairline }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
