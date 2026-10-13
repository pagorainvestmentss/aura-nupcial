import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Guest, WeddingEvent } from '../../types/wedding';
import { InvitationExperience } from '../../components/invitation/InvitationExperience';
import { InvalidInvitation } from '../../components/invitation/InvalidInvitation';
import { useInviteByToken } from '../../hooks/useInviteByToken';

/**
 * Experiência do CONVIDADO — /convite/:eventSlug/:guestToken
 * Sem dashboard, sem sidebar, sem menu de gestão.
 * Acesso exclusivo pelo token individual do convidado.
 *
 * O carregamento (caminho anónimo via RPC + caminho do casal autenticado para
 * pré-visualização de rascunhos) vive em `useInviteByToken`, partilhado com o
 * cartão de impressão (`PrintInvitationPage`).
 */
export const InvitationPage: React.FC = () => {
  const { eventSlug = '', guestToken = '' } = useParams();
  const navigate = useNavigate();
  const state = useInviteByToken(eventSlug, guestToken);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F1EA]">
        <p className="text-sm text-stone-500 font-sans">A preparar o seu convite…</p>
      </div>
    );
  }

  if (state.reason === 'revoked') {
    return <InvalidInvitation reason="revoked" onGoHome={() => navigate('/')} />;
  }

  const { event, guest } = state;
  if (state.reason === 'not_found' || !event || !guest) {
    return <InvalidInvitation reason="not_found" onGoHome={() => navigate('/')} />;
  }

  if (event.status === 'suspended') {
    return <InvalidInvitation reason="revoked" onGoHome={() => navigate('/')} />;
  }

  return <InvitationShell key={guest.id} event={event} guest={guest} preview={event.status === 'draft'} />;
};

const InvitationShell: React.FC<{
  event: WeddingEvent;
  guest: Guest;
  preview?: boolean;
}> = ({ event, guest, preview }) => {
  const [updatedGuest, setUpdatedGuest] = useState<Guest>(guest);

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
    </>
  );
};
