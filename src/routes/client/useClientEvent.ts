import React from 'react';
import { useAuth } from '../../app/AuthContext';
import { WeddingStorageService } from '../../services/weddingStorage';
import { Couple, Guest, WeddingEvent } from '../../types/wedding';

/**
 * Devolve casal, evento e convidados da sessão do cliente.
 * Re-carrega sempre que `version` muda (para refresh manual após mutações).
 */
export function useClientEvent(version = 0): {
  couple: Couple | null;
  event: WeddingEvent | null;
  guests: Guest[];
} {
  const { session } = useAuth();

  return React.useMemo(() => {
    const couple = session?.coupleId
      ? WeddingStorageService.getCoupleById(session.coupleId) || null
      : null;
    const event = couple
      ? WeddingStorageService.getEventById(couple.activeEventId) ||
        WeddingStorageService.getEvents().find((e) => e.coupleId === couple.id) ||
        null
      : null;
    const guests = event ? WeddingStorageService.getGuestsByEventId(event.id) : [];
    return { couple, event, guests };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.coupleId, version]);
}
