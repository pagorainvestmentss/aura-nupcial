export type SalutationType = 'individual' | 'couple' | 'family' | 'custom';

export type RsvpStatus = 'pending' | 'confirmed' | 'declined' | 'partially_confirmed';

export type QrStatus = 'active' | 'used' | 'revoked';

export type EventStatus = 'draft' | 'preview' | 'active' | 'suspended';

export type ClientStatus = 'active' | 'suspended';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export type PlanId = 'starter' | 'pro' | 'premium';

export type OccasionId = 'casamento' | 'noivado' | 'aniversario' | 'outra';

export type UserRole = 'admin' | 'cliente';

export type ColorPaletteId = 'sage' | 'terra' | 'classic' | 'romance';

export interface ColorPalette {
  id: ColorPaletteId;
  name: string;
  paperBg: string;
  paperWarm: string;
  primaryText: string;
  mutedText: string;
  accent: string;
  accentSoft: string;
  hairline: string;
  sealColor: string;
  goldAccent: string;
}

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  salutationType: SalutationType;
  customSalutation?: string;
  relationship?: string;
  phone?: string;
  token: string;
  maxGuests: number;
  confirmedGuests: number;
  rsvpStatus: RsvpStatus;
  rsvpDate?: string;
  rsvpNotes?: string;
  dietaryRestrictions?: string;
  /** Nomes dos acompanhantes confirmados (1 entrada = 1 lugar extra). */
  companions?: string[];
  /** Grupo escolhido pelo convidado (ex.: Noiva / Noivo) — rótulos por ocasião. */
  group?: string;
  accessedAt?: string;
  accessCount: number;
  qrStatus: QrStatus;
  qrScannedAt?: string;
  qrScannedBy?: string;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  iconName: 'church' | 'rings' | 'cheers' | 'utensils' | 'music' | 'cake' | 'party' | 'heart' | 'car';
}

export interface GuestManualItem {
  id: string;
  title: string;
  description: string;
  iconName: 'clock' | 'camera' | 'sparkles' | 'ban' | 'smile' | 'heart' | 'users' | 'wine';
  enabled: boolean;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  aspect?: 'portrait' | 'landscape' | 'square';
}

export interface WeddingEvent {
  id: string;
  coupleId: string;
  occasion: OccasionId;
  slug: string;
  brideName: string;
  groomName: string;
  conjunction: string; // '&' or 'e'
  monogram: string; // 'M & P' or 'MP'
  dateDisplay: string; // e.g., '15 Janeiro 2027'
  dateIso: string; // '2027-01-15'
  locationDisplay: string; // 'LUANDA — ANGOLA'
  
  // Verse and Invitation details
  verse: {
    text: string;
    citation: string;
  };
  parentsHonoring?: string;
  invitationIntro: string; // "Têm a honra de convidar Vossa(s) Exa(s) para testemunhar o enlace matrimonial..."

  // Locations
  ceremony: {
    title: string;
    time: string;
    venue: string;
    address: string;
    mapsUrl: string;
  };
  reception: {
    title: string;
    time: string;
    venue: string;
    address: string;
    mapsUrl: string;
  };

  // Photos
  heroPhoto: string;
  intimatePhoto: string;
  ringsPhoto: string;
  gallery: GalleryPhoto[];

  // Timeline
  timeline: TimelineItem[];

  // Declarations
  declarations: {
    groom: {
      author: string;
      quote: string;
    };
    bride: {
      author: string;
      quote: string;
    };
  };

  // Guest Manual
  guestManual: GuestManualItem[];

  // Couple Final Message
  coupleMessage: {
    title: string;
    body: string;
    signOff: string;
  };

  // Template & Theme
  templateId: 'botanical-sage' | 'elegance-terracotta' | 'classic-gold' | 'romance-rose';
  paletteId: ColorPaletteId;

  // Settings
  status: EventStatus;
  rsvpDeadline: string;
  allowPlusOnes: boolean;
  enableMusic: boolean;
  enableQrValidation: boolean;
}

export interface Couple {
  id: string;
  name: string; // e.g. "Mariana & Pedro"
  email: string;
  phone: string;
  createdAt: string;
  plan: PlanId;
  /**
   * Upgrade pedido pelo cliente (ex.: Starter → Premium) que só passa a
   * `plan` quando a equipa confirma o pagamento. `null`/ausente = sem pedido.
   */
  pendingPlan?: PlanId | null;
  activeEventId: string;
  status: ClientStatus;
  paymentStatus: PaymentStatus;
  password: string;
}

export interface PlatformSettings {
  brandName: string;
  supportEmail: string;
  supportPhone: string;
}

export interface AuthSession {
  role: UserRole;
  email: string;
  displayName: string;
  coupleId?: string;
}
