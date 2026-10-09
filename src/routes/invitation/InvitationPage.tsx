import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WeddingStorageService } from '../../services/weddingStorage';
import { Guest, WeddingEvent } from '../../types/wedding';
import { InvitationExperience } from '../../components/invitation/InvitationExperience';
import { InvalidInvitation } from '../../components/invitation/InvalidInvitation';
import { useAuth } from '../../app/AuthContext';

/**
 * Experiência do CONVIDADO — /convite/:eventSlug/:guestToken
 * Sem dashboard, sem sidebar, sem menu de gestão.
 * Acesso exclusivo pelo token individual do convidado.
 * Um convite em rascunho bloqueia os convidados, mas o casal dono
 * pode pré-visualizá-lo a partir da sua área de cliente.
 */
export const InvitationPage: React.FC = () => {
  const { eventSlug = '', guestToken = '' } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const { event, guest } = useMemo(() => {
    const ev = WeddingStorageService.getEventBySlug(eventSlug);
    if (!ev) return { event: null, guest: null };

    const g = WeddingStorageService.getGuestsByEventId(ev.id).find(
      (item) => item.token.toLowerCase() === guestToken.toLowerCase()
    );
    return { event: ev, guest: g || null };
  }, [eventSlug, guestToken]);

  // NOTA: o acesso (recordAccess) só é registado DENTRO da InvitationShell —
  // depois de todos os gates (suspenso/rascunho) — para não contar aberturas
  // de convites bloqueados.

  if (!event || !guest) {
    return <InvalidInvitation reason="not_found" onGoHome={() => navigate('/')} />;
  }

  if (event.status === 'suspended') {
    return <InvalidInvitation reason="revoked" onGoHome={() => navigate('/')} />;
  }

  // Casal suspenso pelo admin → convite bloqueado para todos.
  const couple = WeddingStorageService.getCoupleById(event.coupleId);
  if (couple?.status === 'suspended') {
    return <InvalidInvitation reason="revoked" onGoHome={() => navigate('/')} />;
  }

  // Rascunho: bloqueado para convidados... mas o casal dono pode pré-visualizar.
  if (event.status === 'draft') {
    const isOwner =
      session?.role === 'cliente' &&
      Boolean(
        session.coupleId &&
          WeddingStorageService.getEvents().some(
            (e) => e.id === event.id && e.coupleId === session.coupleId
          )
      );
    if (!isOwner) {
      return <InvalidInvitation reason="revoked" onGoHome={() => navigate('/')} />;
    }
  }

  return <InvitationShell key={guest.id} event={event} guest={guest} preview={event.status === 'draft'} />;
};

const InvitationShell: React.FC<{
  event: WeddingEvent;
  guest: Guest;
  preview?: boolean;
}> = ({ event, guest, preview }) => {
  const [updatedGuest, setUpdatedGuest] = useState<Guest>(guest);
  const navigate = useNavigate();

  // Contagem de aberturas: só quando o convite abre a um convidado real.
  // Pré-visualização do casal (rascunho) não conta como abertura.
  useEffect(() => {
    if (!preview) {
      WeddingStorageService.recordAccess(guest.id);
    }
  }, [guest.id, preview]);

  const allGuests = useMemo(
    () => WeddingStorageService.getGuestsByEventId(event.id),
    [event.id, updatedGuest.rsvpStatus]
  );

  return (
    <>
      <InvitationExperience
        event={event}
        guest={updatedGuest}
        onGuestUpdate={setUpdatedGuest}
        showEnvelopeInitial={true}
      />

      {/* Pré-visualização do casal — rascunho ainda não publicado. */}
      {preview && (
        <div className="no-print fixed top-0 inset-x-0 z-50 bg-amber-100 border-b border-amber-300 text-amber-900 text-center text-[11px] uppercase tracking-widest font-sans py-1.5 px-3">
          Pré-visualização — o convite ainda não está publicado
        </div>
      )}

      {/* Alternateador de convidado — apenas em desenvolvimento (vaza tokens se aparecer em produção). */}
      {import.meta.env.DEV && allGuests.length > 1 && (
        <aside
          aria-label="Alternar convidado de demonstração"
          className="no-print fixed bottom-3 left-3 z-50 max-w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur border border-stone-300 rounded-xs shadow-md px-3 py-2 flex flex-wrap items-center gap-1.5"
        >
          <span className="text-[9px] uppercase tracking-widest text-stone-400 mr-1">
            Demo:
          </span>
          {allGuests.map((g) => (
            <button
              key={g.id}
              onClick={() => navigate(`/convite/${event.slug}/${g.token}`)}
              className={`px-2 py-1 rounded-xs text-[11px] cursor-pointer transition-colors ${
                guest.id === g.id
                  ? 'bg-[#5E6B56] text-white'
                  : 'bg-[#FAF7F2] border border-stone-300 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {g.name}
            </button>
          ))}
        </aside>
      )}
    </>
  );
};
