import React from 'react';
import { useAuth } from '../../app/AuthContext';
import { getRepo } from '../../services/repo';
import { Couple, Guest, WeddingEvent } from '../../types/wedding';

interface ClientEventData {
  couple: Couple | null;
  event: WeddingEvent | null;
  guests: Guest[];
}

/**
 * Devolve casal, evento e convidados da sessão do cliente.
 * Re-carrega sempre que `version` muda (para refresh manual após mutações).
 * O carregamento é assíncrono (Supabase ou localStorage) — expõe também
 * `loading` para as páginas mostrarem o estado de carregamento.
 */
export function useClientEvent(version = 0): ClientEventData & { loading: boolean } {
  const { session } = useAuth();
  const [data, setData] = React.useState<ClientEventData>({
    couple: null,
    event: null,
    guests: []
  });
  const [loading, setLoading] = React.useState(true);

  const coupleId = session?.coupleId;

  React.useEffect(() => {
    let active = true;

    if (!coupleId) {
      setData({ couple: null, event: null, guests: [] });
      setLoading(false);
      return;
    }

    (async () => {
      const repo = getRepo();
      const couple = (await repo.getCoupleById(coupleId)) || null;
      let event: WeddingEvent | null = null;
      if (couple) {
        event =
          (await repo.getEventById(couple.activeEventId)) ||
          (await repo.getEvents()).find((e) => e.coupleId === couple.id) ||
          null;
      }
      const guests = event ? await repo.getGuestsByEventId(event.id) : [];
      if (!active) return;
      setData({ couple, event, guests });
      setLoading(false);
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId, version]);

  return { ...data, loading };
}
