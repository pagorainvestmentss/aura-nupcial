import { useEffect, useState } from 'react';
import { getRepo } from '../services/repo';
import { Guest, WeddingEvent } from '../types/wedding';
import { useAuth } from '../app/AuthContext';

export interface InviteState {
  loading: boolean;
  event: WeddingEvent | null;
  guest: Guest | null;
  reason: 'not_found' | 'revoked' | null;
}

/**
 * Carrega evento + convidado a partir do par ``:eventSlug/:guestToken``.
 *
 * Dois caminhos de carregamento (idênticos aos da página do convite):
 *  - ANÓNIMO (convidado) → ``getGuestByToken`` (em produção usa a RPC pública que
 *    valida o token, regista o acesso e só devolve eventos activos).
 *  - CLIENTE autenticado (pré-visualização) → leitura directa, para que o casal
 *    possa ver um convite ainda em rascunho. Um rascunho bloqueia os convidados,
 *    mas o dono pode pré-visualizá-lo.
 *
 * Gates comuns (suspensão do evento/casal, rascunho) são aplicados aqui para que
 * qualquer página que use o hook (convite digital, cartão de impressão) fique
 * protegida pela mesma lógica.
 */
export const useInviteByToken = (eventSlug: string, guestToken: string): InviteState => {
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

  return state;
};
