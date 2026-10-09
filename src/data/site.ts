import { PlanId } from '../types/wedding';

export const WHATSAPP_DISPLAY = '+244 940 989 328';
export const WHATSAPP_NUMBER = '244940989328';

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Limite de convidados por pacote — null = ilimitado. */
export const PLAN_GUEST_LIMIT: Record<PlanId, number | null> = {
  starter: 30,
  pro: null
};

export function planGuestLimitLabel(plan: PlanId): string {
  const limit = PLAN_GUEST_LIMIT[plan];
  return limit === null ? 'Ilimitados' : `Até ${limit} convidados`;
}

export function canAddGuest(plan: PlanId, currentCount: number): boolean {
  const limit = PLAN_GUEST_LIMIT[plan];
  return limit === null || currentCount < limit;
}

/** Limite de fotos da galeria do convite por plano. */
export const PLAN_GALLERY_LIMIT: Record<PlanId, number> = {
  starter: 6,
  pro: 20
};


