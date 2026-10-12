import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRepo } from '../../services/repo';
import { Guest, WeddingEvent } from '../../types/wedding';
import { InvitationExperience } from '../../components/invitation/InvitationExperience';
import { InvalidInvitation } from '../../components/invitation/InvalidInvitation';
import { useAuth } from '../../app/AuthContext';

interface InviteState {
  loading: boolean;
  event: WeddingEvent | null;
  guest: Guest | null;
  reason: 'not_found' | 'revoked' | null;
}

/**
 * Experiência do CONVIDADO — /convite/:eventSlug/:guestToken
 * Sem dashboard, sem sidebar, sem menu de gestão.
 * Acesso exclusivo pelo token individual do convidado.
 *
 * Dois caminhos de carregamento:
 *  - ANÓNIMO (convidado) → `getGuestByToken` (em produção usa a RPC pública que
 *    valida o token, regista o acesso e só devolve eventos activos).
 *  - CLIENTE autenticado (pré-visualização) → leitura directa, para que o casal
 *    possa ver um convite ainda em rascunho. Um rascunho bloqueia os convidados,
 *    mas o dono pode pré-visualizá-lo.
 */
export const InvitationPage: React.FC = () => {
  const { eventSlug = '', guestToken = '' } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isClient = session?.role === 'cliente';

  const [state, setState] = useState<InviteState>({
    loading: true,
    event: null,
    guest: null,
    reason: null
  });

  useEffect(() => {
    let active = true;
    setState({ loading: true, event: null, guest: null, reason: null });

    (async () => {
      const repo = getRepo();
      let ev: WeddingEvent | null = null;
      let g: Guest | null = null;
      let coupleStatus: string | undefined;

      if (!isClient) {
        // Convidado anónimo — caminho único do servidor.
        const res = await repo.getGuestByToken(eventSlug, guestToken);
        if (!active) return;
        ev = res.event || null;
        g = res.guest || null;
        coupleStatus = res.coupleStatus;
      } else {
        // Casal autenticado — leitura directa (permite pré-visualizar rascunhos).
        ev = (await repo.getEventBySlug(eventSlug)) || null;
        if (!active) return;
        if (ev) {
          const guests = await repo.getGuestsByEventId(ev.id);
          g = guests.find((i) => i.token.toLowerCase() === guestToken.toLowerCase()) || null;
        }
      }

      if (!active) return;
      if (!ev || !g) {
        setState({ loading: false, event: null, guest: null, reason: 'not_found' });
        return;
      }

      // Gates comuns a ambos os caminhos (em produção a RPC já filtra, aqui é
      // defesa em profundidade e a única barreira no modo local).
      if (ev.status === 'suspended') {
        setState({ loading: false, event: null, guest: null, reason: 'revoked' });
        return;
      }
      // Rascunho: só o casal dono pode ver. Anónimo nunca é dono.
      if (ev.status === 'draft' && ev.coupleId !== session?.coupleId) {
        setState({ loading: false, event: null, guest: null, reason: 'revoked' });
        return;
      }
      // Casal suspenso → convite bloqueado. O caminho anónimo já traz o estado
      // do casal do servidor; o caminho do casal autenticado precisa de o ler.
      if (coupleStatus === 'suspended') {
        setState({ loading: false, event: null, guest: null, reason: 'revoked' });
        return;
      }
      if (!coupleStatus && isClient) {
        const couple = (await repo.getCoupleById(ev.coupleId)) || null;
        if (!active) return;
        if (couple?.status === 'suspended') {
          setState({ loading: false, event: null, guest: null, reason: 'revoked' });
          return;
        }
      }

      setState({ loading: false, event: ev, guest: g, reason: null });
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlug, guestToken, isClient, session?.coupleId]);

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

  // Contagem de aberturas: só quando o convite abre a um convidado real.
  // Pré-visualização do casal (rascunho) não conta. No modo anónimo o acesso
  // já é registado pela RPC do servidor; aqui é um reforço best-effort que
  // falha em silêncio se o convidado não tiver permissão de escrita.
  useEffect(() => {
    if (!preview) {
      getRepo()
        .recordAccess(guest.id)
        .catch(() => {
          /* sem efeito — acesso já registado ou sem permissão */
        });
    }
  }, [guest.id, preview]);

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
