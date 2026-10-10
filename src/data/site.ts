import { PlanId } from '../types/wedding';

export const WHATSAPP_DISPLAY = '+244 940 989 328';
export const WHATSAPP_NUMBER = '244940989328';

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Ordem dos planos: usado para decidir upgrade (rank maior) ou downgrade. */
export const PLAN_RANK: Record<PlanId, number> = {
  starter: 0,
  pro: 1,
  premium: 2
};

export function isUpgrade(from: PlanId, to: PlanId): boolean {
  return PLAN_RANK[to] > PLAN_RANK[from];
}

/** Benefícios de nível Pro (música, QR, galeria alargada) disponíveis? */
export function hasProBenefits(plan: PlanId): boolean {
  return plan === 'pro' || plan === 'premium';
}

/** Nome de apresentação de cada plano. */
export const PLAN_LABEL: Record<PlanId, string> = {
  starter: 'Starter',
  pro: 'Pro',
  premium: 'Premium'
}

/** Limite de convidados por pacote — null = ilimitado. */
export const PLAN_GUEST_LIMIT: Record<PlanId, number | null> = {
  starter: 30,
  pro: 100,
  premium: null
};

export function planGuestLimitLabel(plan: PlanId): string {
  const limit = PLAN_GUEST_LIMIT[plan];
  return limit === null ? 'Ilimitados' : `Até ${limit} convidados`;
}

export function canAddGuest(plan: PlanId, currentCount: number): boolean {
  const limit = PLAN_GUEST_LIMIT[plan];
  return limit === null || currentCount < limit;
}

/** Limite de fotos da galeria do convite por plano — null = ilimitado. */
export const PLAN_GALLERY_LIMIT: Record<PlanId, number | null> = {
  starter: 6,
  pro: 20,
  premium: null
};


