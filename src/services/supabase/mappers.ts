import type {
  ClientStatus,
  Couple,
  EventStatus,
  GalleryPhoto,
  Guest,
  GuestManualItem,
  OccasionId,
  PaymentRequest,
  PaymentRequestKind,
  PaymentRequestStatus,
  PaymentStatus,
  PlanId,
  QrStatus,
  RsvpStatus,
  SalutationType,
  TimelineItem,
  WeddingEvent
} from '../../types/wedding';

/** Linhas tal como devolvidas pelo Postgres (snake_case). */
export interface CoupleRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  plan: string;
  status: string;
  payment_status: string;
  pending_plan: string | null;
  password_reminder: string | null;
  created_at: string;
  active_event_id: string | null;
}

export interface EventRow {
  id: string;
  couple_id: string;
  slug: string;
  status: string;
  template_id: string | null;
  palette_id: string | null;
  date_iso: string | null;
  date_display: string | null;
  location_display: string | null;
  verse_reference: string | null;
  verse_text: string | null;
  invitation_intro: string | null;
  ceremony_title: string | null;
  ceremony_location: string | null;
  ceremony_address: string | null;
  ceremony_time: string | null;
  ceremony_maps_url: string | null;
  reception_title: string | null;
  reception_location: string | null;
  reception_address: string | null;
  reception_time: string | null;
  reception_maps_url: string | null;
  hero_photo: string | null;
  intimate_photo: string | null;
  rings_photo: string | null;
  timeline: TimelineItem[] | null;
  declarations: WeddingEvent['declarations'] | null;
  guest_manual: GuestManualItem[] | null;
  couple_message: WeddingEvent['coupleMessage'] | null;
  gallery: GalleryPhoto[] | null;
  rsvp_deadline: string | null;
  allow_plus_ones: boolean;
  enable_music: boolean;
  enable_qr_validation: boolean;
  created_at: string;
  occasion: string;
  bride_name: string;
  groom_name: string;
  conjunction: string;
  monogram: string;
  age: number | null;
  parents_honoring: string | null;
}

export interface GuestRow {
  id: string;
  event_id: string;
  name: string;
  salutation_type: string | null;
  custom_salutation: string | null;
  relationship: string | null;
  phone: string | null;
  token: string;
  max_guests: number;
  confirmed_guests: number;
  rsvp_status: string;
  rsvp_date: string | null;
  rsvp_notes: string | null;
  dietary_restrictions: string | null;
  accessed_at: string | null;
  access_count: number;
  qr_status: string | null;
  qr_scanned_at: string | null;
  qr_scanned_by: string | null;
  companions: string[] | null;
  group_name: string | null;
}

export interface PaymentRequestRow {
  id: string;
  couple_id: string;
  plan: string;
  kind: string;
  amount_kz: number;
  reference: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  confirmed_by: string | null;
  notes: string | null;
}

// --- helpers ---

const asDate = (v: string | null | undefined): string => (v ? v.slice(0, 10) : '');

const asText = (v: string | null | undefined, fallback = ''): string => v ?? fallback;

// --- couples ---

export function rowToCouple(r: CoupleRow): Couple {
  return {
    id: r.id,
    name: r.name,
    email: asText(r.email),
    phone: asText(r.phone),
    createdAt: asDate(r.created_at),
    plan: (r.plan as PlanId) ?? 'starter',
    pendingPlan: (r.pending_plan as PlanId | null) ?? null,
    activeEventId: asText(r.active_event_id),
    status: (r.status as ClientStatus) ?? 'active',
    paymentStatus: (r.payment_status as PaymentStatus) ?? 'pending',
    // A palavra-passe é gerida pelo Supabase Auth (nunca fica na tabela).
    password: asText(r.password_reminder)
  };
}

export function coupleToRow(c: Couple): Partial<CoupleRow> {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    plan: c.plan,
    status: c.status,
    payment_status: c.paymentStatus,
    pending_plan: c.pendingPlan ?? null,
    active_event_id: c.activeEventId || null
  };
}

// --- events ---

export function rowToEvent(r: EventRow): WeddingEvent {
  return {
    id: r.id,
    coupleId: r.couple_id,
    occasion: (r.occasion as OccasionId) ?? 'casamento',
    slug: r.slug,
    brideName: asText(r.bride_name),
    groomName: asText(r.groom_name),
    conjunction: asText(r.conjunction, '&'),
    monogram: asText(r.monogram),
    age: r.age ?? undefined,
    dateDisplay: asText(r.date_display),
    dateIso: asText(r.date_iso),
    locationDisplay: asText(r.location_display),
    verse: { text: asText(r.verse_text), citation: asText(r.verse_reference) },
    parentsHonoring: asText(r.parents_honoring),
    invitationIntro: asText(r.invitation_intro),
    ceremony: {
      title: asText(r.ceremony_title),
      time: asText(r.ceremony_time),
      venue: asText(r.ceremony_location),
      address: asText(r.ceremony_address),
      mapsUrl: asText(r.ceremony_maps_url)
    },
    reception: {
      title: asText(r.reception_title),
      time: asText(r.reception_time),
      venue: asText(r.reception_location),
      address: asText(r.reception_address),
      mapsUrl: asText(r.reception_maps_url)
    },
    heroPhoto: asText(r.hero_photo),
    intimatePhoto: asText(r.intimate_photo),
    ringsPhoto: asText(r.rings_photo),
    gallery: r.gallery ?? [],
    timeline: r.timeline ?? [],
    declarations: r.declarations ?? {
      groom: { author: '', quote: '' },
      bride: { author: '', quote: '' }
    },
    guestManual: r.guest_manual ?? [],
    coupleMessage: r.couple_message ?? { title: '', body: '', signOff: '' },
    templateId: (r.template_id as WeddingEvent['templateId']) ?? 'botanical-sage',
    paletteId: (r.palette_id as WeddingEvent['paletteId']) ?? 'sage',
    status: (r.status as EventStatus) ?? 'draft',
    rsvpDeadline: asDate(r.rsvp_deadline),
    allowPlusOnes: r.allow_plus_ones ?? true,
    enableMusic: r.enable_music ?? false,
    enableQrValidation: r.enable_qr_validation ?? false
  };
}

export function eventToRow(e: WeddingEvent): Partial<EventRow> {
  return {
    id: e.id,
    couple_id: e.coupleId,
    occasion: e.occasion,
    slug: e.slug,
    bride_name: e.brideName,
    groom_name: e.groomName,
    conjunction: e.conjunction,
    monogram: e.monogram,
    age: e.age ?? null,
    date_display: e.dateDisplay,
    date_iso: e.dateIso || null,
    location_display: e.locationDisplay,
    verse_text: e.verse?.text || null,
    verse_reference: e.verse?.citation || null,
    parents_honoring: e.parentsHonoring || null,
    invitation_intro: e.invitationIntro || null,
    ceremony_title: e.ceremony?.title || null,
    ceremony_time: e.ceremony?.time || null,
    ceremony_location: e.ceremony?.venue || null,
    ceremony_address: e.ceremony?.address || null,
    ceremony_maps_url: e.ceremony?.mapsUrl || null,
    reception_title: e.reception?.title || null,
    reception_time: e.reception?.time || null,
    reception_location: e.reception?.venue || null,
    reception_address: e.reception?.address || null,
    reception_maps_url: e.reception?.mapsUrl || null,
    hero_photo: e.heroPhoto || null,
    intimate_photo: e.intimatePhoto || null,
    rings_photo: e.ringsPhoto || null,
    gallery: e.gallery ?? [],
    timeline: e.timeline ?? [],
    declarations: e.declarations ?? null,
    guest_manual: e.guestManual ?? [],
    couple_message: e.coupleMessage ?? null,
    template_id: e.templateId,
    palette_id: e.paletteId,
    status: e.status,
    rsvp_deadline: e.rsvpDeadline || null,
    allow_plus_ones: e.allowPlusOnes ?? true,
    enable_music: e.enableMusic ?? false,
    enable_qr_validation: e.enableQrValidation ?? false
  };
}

// --- guests ---

export function rowToGuest(r: GuestRow): Guest {
  return {
    id: r.id,
    eventId: r.event_id,
    name: r.name,
    salutationType: (r.salutation_type as SalutationType) ?? 'individual',
    customSalutation: asText(r.custom_salutation) || undefined,
    relationship: asText(r.relationship) || undefined,
    phone: asText(r.phone) || undefined,
    token: r.token,
    maxGuests: r.max_guests ?? 1,
    confirmedGuests: r.confirmed_guests ?? 0,
    rsvpStatus: (r.rsvp_status as RsvpStatus) ?? 'pending',
    rsvpDate: asText(r.rsvp_date) || undefined,
    rsvpNotes: asText(r.rsvp_notes) || undefined,
    dietaryRestrictions: asText(r.dietary_restrictions) || undefined,
    companions: r.companions ?? [],
    group: asText(r.group_name) || undefined,
    accessedAt: asText(r.accessed_at) || undefined,
    accessCount: r.access_count ?? 0,
    qrStatus: (r.qr_status as QrStatus) ?? 'active',
    qrScannedAt: asText(r.qr_scanned_at) || undefined,
    qrScannedBy: asText(r.qr_scanned_by) || undefined
  };
}

export function guestToRow(g: Guest): Partial<GuestRow> {
  return {
    id: g.id,
    event_id: g.eventId,
    name: g.name,
    salutation_type: g.salutationType,
    custom_salutation: g.customSalutation || null,
    relationship: g.relationship || null,
    phone: g.phone || null,
    token: g.token,
    max_guests: g.maxGuests ?? 1,
    confirmed_guests: g.confirmedGuests ?? 0,
    rsvp_status: g.rsvpStatus,
    rsvp_date: g.rsvpDate || null,
    rsvp_notes: g.rsvpNotes || null,
    dietary_restrictions: g.dietaryRestrictions || null,
    companions: g.companions ?? [],
    group_name: g.group || null,
    accessed_at: g.accessedAt || null,
    access_count: g.accessCount ?? 0,
    qr_status: g.qrStatus,
    qr_scanned_at: g.qrScannedAt || null,
    qr_scanned_by: g.qrScannedBy || null
  };
}

// --- payment requests ---

export function rowToPaymentRequest(r: PaymentRequestRow): PaymentRequest {
  return {
    id: r.id,
    coupleId: r.couple_id,
    plan: (r.plan as PlanId) ?? 'starter',
    kind: (r.kind as PaymentRequestKind) ?? 'initial',
    amountKz: r.amount_kz ?? 0,
    reference: r.reference,
    status: (r.status as PaymentRequestStatus) ?? 'pending',
    createdAt: r.created_at,
    paidAt: asText(r.paid_at) || undefined,
    confirmedBy: asText(r.confirmed_by) || undefined,
    notes: asText(r.notes) || undefined
  };
}

export function paymentRequestToRow(p: PaymentRequest): Partial<PaymentRequestRow> {
  return {
    id: p.id,
    couple_id: p.coupleId,
    plan: p.plan,
    kind: p.kind,
    amount_kz: p.amountKz,
    reference: p.reference,
    status: p.status
  };
}
