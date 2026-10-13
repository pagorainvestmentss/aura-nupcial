import type { ClientStatus, Couple, EventStatus, Guest, PaymentRequest, PaymentRequestKind, PaymentRequestStatus, PaymentStatus, PlanId, WeddingEvent } from '../../types/wedding';
import { extractQrToken } from '../weddingStorage';
import { isUpgrade } from '../../data/site';
import { generatePaymentReference } from '../../utils/reference';
import type { CreatePaymentRequestParams, PlatformSettings, QrValidationResult, UpdateRsvpParams, UpdateRsvpResult, WeddingRepository } from '../repository';
import { getSupabase } from './client';
import {
  coupleToRow,
  eventToRow,
  guestToRow,
  paymentRequestToRow,
  rowToCouple,
  rowToEvent,
  rowToGuest,
  rowToPaymentRequest,
  type CoupleRow,
  type EventRow,
  type GuestRow,
  type PaymentRequestRow
} from './mappers';
import {
  cleanupRemovedPhotos,
  removeEventFolder,
  resolveEventPhotos,
  storeEventPhotos
} from './storage';

type AnyJson = Record<string, unknown>;

const db = () => getSupabase();

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * Linha → evento pronto a usar: além do mapeamento, os caminhos do bucket
 * `event-photos` são resolvidos para URLs públicas de leitura.
 * `dataURL` e URLs antigas passam intactas (convites já publicados).
 */
function toEvent(row: EventRow): WeddingEvent {
  return resolveEventPhotos(rowToEvent(row));
}

/** Carrega convidado (por token) e o seu evento — usado na validação de QR. */
async function loadGuestAndEvent(token: string): Promise<{ guest?: Guest; event?: WeddingEvent }> {
  const { data: g } = await db().from('guests').select('*').ilike('token', token).maybeSingle();
  const guest = g ? rowToGuest(g as GuestRow) : undefined;
  if (!guest) return {};
  const { data: e } = await db().from('events').select('*').eq('id', guest.eventId).maybeSingle();
  return { guest, event: e ? toEvent(e as EventRow) : undefined };
}

/**
 * Implementação de produção sobre o Supabase.
 *
 * Regras de acesso (RLS):
 *  - ADMIN e CLIENTE estão autenticados → leem/escrivem as suas linhas.
 *  - O CONVIDADO (convite público) não tem sessão: só a RPC `resolve_invitation`
 *    (segurança definer, concedida a `anon`) resolve slug+token e devolve o
 *    evento, o convidado e o estado do casal — nunca a lista de convidados.
 *  - As falhas de escrita do visitante anónimo são silenciadas (best-effort),
 *    para a app nunca rebentar por falta de permissão numa acção acessória.
 */
export const supabaseRepository: WeddingRepository = {
  init: async () => {
    // Sem semente: a base de dados já existe com o seu estado.
  },

  // --- Casais -------------------------------------------------------------
  async getCouples(): Promise<Couple[]> {
    const { data, error } = await db().from('couples').select('*');
    if (error) throw new Error(`Não foi possível carregar os clientes: ${errMsg(error)}`);
    return ((data ?? []) as CoupleRow[]).map(rowToCouple);
  },

  async getCoupleById(coupleId: string): Promise<Couple | undefined> {
    const { data, error } = await db().from('couples').select('*').eq('id', coupleId).maybeSingle();
    if (error) throw new Error(`Não foi possível carregar o cliente: ${errMsg(error)}`);
    return data ? rowToCouple(data as CoupleRow) : undefined;
  },

  async saveCouple(couple: Couple): Promise<void> {
    const { error } = await db().from('couples').upsert(coupleToRow(couple), { onConflict: 'id' });
    if (error) throw new Error(`Não foi possível guardar o cliente: ${errMsg(error)}`);
  },

  updateCouple(couple: Couple): Promise<void> {
    return this.saveCouple(couple);
  },

  async deleteCouple(coupleId: string): Promise<void> {
    // Cascata explícita: convidados → eventos → casal.
    const { data: evRows } = await db().from('events').select('id').eq('couple_id', coupleId);
    const eventIds = ((evRows ?? []) as { id: string }[]).map((r) => r.id);
    if (eventIds.length > 0) {
      await db().from('guests').delete().in('event_id', eventIds);
      await db().from('events').delete().eq('couple_id', coupleId);
    }
    const { error } = await db().from('couples').delete().eq('id', coupleId);
    if (error) throw new Error(`Não foi possível remover o cliente: ${errMsg(error)}`);
    for (const eventId of eventIds) {
      await removeEventFolder(coupleId, eventId);
    }
  },

  async setClientStatus(coupleId: string, status: ClientStatus): Promise<void> {
    const { error } = await db().from('couples').update({ status }).eq('id', coupleId);
    if (error) throw new Error(`Não foi possível alterar o estado: ${errMsg(error)}`);
  },

  async setPaymentStatus(coupleId: string, paymentStatus: PaymentStatus): Promise<void> {
    const couple = await this.getCoupleById(coupleId);
    if (!couple) return;
    const next: Partial<Couple> = { ...couple, paymentStatus };
    // Upgrade pendente só fica activo quando a equipa confirma o pagamento.
    if (paymentStatus === 'paid' && couple.pendingPlan) {
      next.plan = couple.pendingPlan;
      next.pendingPlan = null;
    }
    await this.saveCouple(next as Couple);
  },

  async requestPlanChange(coupleId: string, plan: PlanId): Promise<void> {
    const couple = await this.getCoupleById(coupleId);
    if (!couple) return;

    if (isUpgrade(couple.plan, plan)) {
      if (couple.pendingPlan === plan) return;
      await this.saveCouple({ ...couple, pendingPlan: plan });
      return;
    }
    // Downgrade ou cancelamento de um pedido pendente.
    await this.saveCouple({ ...couple, plan, pendingPlan: null });
  },

  // --- Pedidos de pagamento (Fase 0) ---------------------------------------
  async createPaymentRequest(params: CreatePaymentRequestParams): Promise<PaymentRequest> {
    const supabase = db();
    // Referência gerada no cliente; em caso de colisão (23505) tenta outra vez.
    for (let attempt = 0; ; attempt++) {
      const row: Omit<PaymentRequestRow, 'paid_at' | 'confirmed_by' | 'notes' | 'created_at'> & { created_at?: string } = {
        id: crypto.randomUUID(),
        couple_id: params.coupleId,
        plan: params.plan,
        kind: params.kind,
        amount_kz: params.amountKz,
        reference: generatePaymentReference(),
        status: 'pending'
      };
      const { data, error } = await supabase
        .from('payment_requests')
        .insert(row)
        .select('*')
        .single();
      if (!error && data) return rowToPaymentRequest(data as PaymentRequestRow);
      const code = (error as { code?: string } | null)?.code;
      if (code !== '23505' || attempt >= 2) {
        throw new Error(`Não foi possível criar o pedido de pagamento: ${errMsg(error)}`);
      }
    }
  },

  async getPaymentRequests(coupleId?: string): Promise<PaymentRequest[]> {
    let query = db().from('payment_requests').select('*');
    if (coupleId) query = query.eq('couple_id', coupleId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(`Não foi possível carregar os pedidos de pagamento: ${errMsg(error)}`);
    return ((data ?? []) as PaymentRequestRow[]).map(rowToPaymentRequest);
  },

  async setPaymentRequestStatus(
    requestId: string,
    status: Exclude<PaymentRequestStatus, 'pending'>,
    confirmedBy?: string
  ): Promise<void> {
    const supabase = db();
    const { data: request, error: fetchError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();
    if (fetchError || !request) {
      throw new Error('Pedido de pagamento não encontrado.');
    }
    const row = request as PaymentRequestRow;
    if (row.status !== 'pending') return; // já processado — idempotente

    const patch: Partial<PaymentRequestRow> =
      status === 'paid'
        ? { status, paid_at: new Date().toISOString(), confirmed_by: confirmedBy ?? null }
        : { status };
    const { error } = await supabase.from('payment_requests').update(patch).eq('id', requestId);
    if (error) throw new Error(`Não foi possível actualizar o pedido: ${errMsg(error)}`);

    if (status === 'paid') {
      await this.setPaymentStatus(row.couple_id, 'paid');
    }
  },

  // --- Eventos ------------------------------------------------------------
  async getEvents(): Promise<WeddingEvent[]> {
    const { data, error } = await db().from('events').select('*');
    if (error) throw new Error(`Não foi possível carregar os convites: ${errMsg(error)}`);
    return ((data ?? []) as EventRow[]).map(toEvent);
  },

  async getEventById(eventId: string): Promise<WeddingEvent | undefined> {
    const { data, error } = await db().from('events').select('*').eq('id', eventId).maybeSingle();
    if (error) throw new Error(`Não foi possível carregar o convite: ${errMsg(error)}`);
    return data ? toEvent(data as EventRow) : undefined;
  },

  async getEventBySlug(slug: string): Promise<WeddingEvent | undefined> {
    const { data, error } = await db().from('events').select('*').ilike('slug', slug).maybeSingle();
    if (error) throw new Error(`Não foi possível carregar o convite: ${errMsg(error)}`);
    return data ? toEvent(data as EventRow) : undefined;
  },

  async saveEvent(event: WeddingEvent): Promise<boolean> {
    // Fotos pendentes (dataURL) vão para o bucket event-photos: a linha guarda
    // só o caminho. Compara-se com a versão anterior (cru, com caminhos) para
    // limpar do bucket as fotos substituídas ou removidas.
    const { data: prevRow } = await db().from('events').select('*').eq('id', event.id).maybeSingle();
    const previous = prevRow ? rowToEvent(prevRow as EventRow) : undefined;
    const stored = await storeEventPhotos(event);

    const { error } = await db().from('events').upsert(eventToRow(stored), { onConflict: 'id' });
    if (error) throw new Error(`Não foi possível guardar o convite: ${errMsg(error)}`);

    await cleanupRemovedPhotos(previous, stored);
    return true;
  },

  async deleteEvent(eventId: string): Promise<void> {
    const { data: row } = await db().from('events').select('couple_id').eq('id', eventId).maybeSingle();
    await db().from('guests').delete().eq('event_id', eventId);
    await db().from('couples').update({ active_event_id: null }).eq('active_event_id', eventId);
    const { error } = await db().from('events').delete().eq('id', eventId);
    if (error) throw new Error(`Não foi possível remover o convite: ${errMsg(error)}`);
    if (row) await removeEventFolder((row as { couple_id: string }).couple_id, eventId);
  },

  async setEventStatus(eventId: string, status: EventStatus): Promise<void> {
    const { error } = await db().from('events').update({ status }).eq('id', eventId);
    if (error) throw new Error(`Não foi possível alterar o estado do convite: ${errMsg(error)}`);
  },

  // --- Convidados ---------------------------------------------------------
  async getGuests(): Promise<Guest[]> {
    const { data, error } = await db().from('guests').select('*');
    if (error) throw new Error(`Não foi possível carregar os convidados: ${errMsg(error)}`);
    return ((data ?? []) as GuestRow[]).map(rowToGuest);
  },

  async getGuestsByEventId(eventId: string): Promise<Guest[]> {
    const { data, error } = await db().from('guests').select('*').eq('event_id', eventId);
    if (error) throw new Error(`Não foi possível carregar os convidados: ${errMsg(error)}`);
    return ((data ?? []) as GuestRow[]).map(rowToGuest);
  },

  /**
   * Caminho do CONVIDADO (sem sessão): resolve slug+token pela RPC e regista a
   * abertura. Devolve também o estado do casal para o gate de suspensão.
   */
  async getGuestByToken(
    coupleSlug: string,
    token: string
  ): Promise<{ event?: WeddingEvent; guest?: Guest; coupleStatus?: ClientStatus }> {
    const { data, error } = await db().rpc('resolve_invitation', {
      p_slug: coupleSlug,
      p_token: token
    });
    if (error) throw new Error(`Convite indisponível: ${errMsg(error)}`);
    const json = data as AnyJson | null;
    if (!json || json.ok !== true) return {};

    const event = json.event ? toEvent(json.event as EventRow) : undefined;
    const guest = json.guest ? rowToGuest(json.guest as GuestRow) : undefined;
    const coupleStatus = (json.couple_status as ClientStatus | null) ?? undefined;
    return { event, guest, coupleStatus };
  },

  async saveGuest(guest: Guest): Promise<void> {
    const { error } = await db().from('guests').upsert(guestToRow(guest), { onConflict: 'id' });
    if (error) throw new Error(`Não foi possível guardar o convidado: ${errMsg(error)}`);
  },

  async deleteGuest(guestId: string): Promise<void> {
    const { error } = await db().from('guests').delete().eq('id', guestId);
    if (error) throw new Error(`Não foi possível remover o convidado: ${errMsg(error)}`);
  },

  // --- RSVP ---------------------------------------------------------------
  async updateRsvp(params: UpdateRsvpParams): Promise<UpdateRsvpResult> {
    // O convite público é anónimo: o RLS bloqueia qualquer SELECT em `guests`,
    // por isso o token NUNCA é lido da base — vem da chamada inicial
    // (`resolve_invitation`) e é passado pela UI. A RPC identifica o convidado
    // só pelo token e faz o UPDATE inteiro dentro de SECURITY DEFINER.
    const token = params.guestToken?.trim();
    if (!token) return { success: false };

    const { data, error } = await db().rpc('submit_rsvp', {
      p_token: token,
      p_status: params.rsvpStatus,
      p_confirmed_guests: params.confirmedGuests,
      p_notes: params.notes ?? null,
      p_dietary: params.dietaryRestrictions ?? null,
      p_companions: params.companions ?? null,
      p_group: params.group ?? null
    });
    if (error) return { success: false, error: 'armazenamento' };

    const json = data as AnyJson | null;
    if (!json || json.ok !== true) {
      const code = json?.error;
      if (code === 'deadline_passed') return { success: false, error: 'prazo' };
      return { success: false };
    }

    // A RPC só devolve { ok, status } e voltar a ler o convidado falharia com
    // o mesmo RLS. Projecta-se a resposta sobre o convidado já carregado, para
    // a UI não perder o nome, a saudação personalizada nem os lugares.
    const base = params.currentGuest;
    const next: Guest = {
      id: params.guestId,
      eventId: base?.eventId ?? '',
      name: base?.name ?? '',
      salutationType: base?.salutationType ?? 'individual',
      customSalutation: base?.customSalutation,
      relationship: base?.relationship,
      phone: base?.phone,
      token,
      maxGuests: base?.maxGuests ?? 1,
      confirmedGuests: params.confirmedGuests,
      rsvpStatus: params.rsvpStatus,
      rsvpDate: new Date().toISOString(),
      rsvpNotes: params.notes ?? '',
      dietaryRestrictions: params.dietaryRestrictions ?? '',
      companions: params.rsvpStatus === 'confirmed' ? (params.companions ?? []) : [],
      group: params.group ?? '',
      accessedAt: base?.accessedAt,
      accessCount: base?.accessCount ?? 0,
      qrStatus: base?.qrStatus ?? 'active',
      qrScannedAt: base?.qrScannedAt,
      qrScannedBy: base?.qrScannedBy
    };
    return { success: true, guest: next };
  },

  // --- QR -----------------------------------------------------------------
  async validateQrCheckIn(input: string, scannedBy = 'Recepção / Check-in'): Promise<QrValidationResult> {
    const token = extractQrToken(input);
    const { data, error } = await db().rpc('validate_qr', { p_token: token, p_scanned_by: scannedBy });
    if (error) throw new Error(`Falha na validação: ${errMsg(error)}`);

    const json = (data as AnyJson | null) ?? {};
    const loaded = await loadGuestAndEvent(token);

    if (json.ok === true) {
      return { valid: true, status: 'VALID', message: 'Convite válido! Entrada autorizada.', ...loaded };
    }

    switch (json.error) {
      case 'revoked':
        return {
          valid: false,
          status: 'REVOKED',
          message: 'Este convite foi revogado pela organização.',
          ...loaded
        };
      case 'already_used': {
        const at = loaded.guest?.qrScannedAt || (json.scanned_at as string | undefined) || '';
        return {
          valid: false,
          status: 'ALREADY_USED',
          message: `Convite já utilizado em ${new Date(at).toLocaleString('pt-PT')}.`,
          ...loaded
        };
      }
      default:
        return { valid: false, status: 'NOT_FOUND', message: 'Convite não encontrado no sistema.' };
    }
  },

  // --- Definições da plataforma ------------------------------------------
  async getSettings(): Promise<PlatformSettings> {
    const { data, error } = await db().from('platform_settings').select('*').eq('id', 1).maybeSingle();
    if (error || !data) {
      return { brandName: 'Aura Nupcial', supportEmail: 'ola@auranupcial.com', supportPhone: '+244 923 000 000' };
    }
    const row = data as {
      brand_name?: string;
      support_email?: string;
      support_phone?: string;
      payment_iban?: string;
      payment_mcx_phone?: string;
      payment_holder_name?: string;
    };
    return {
      brandName: row.brand_name || 'Aura Nupcial',
      supportEmail: row.support_email || 'ola@auranupcial.com',
      supportPhone: row.support_phone || '+244 923 000 000',
      paymentIban: row.payment_iban || undefined,
      paymentMcxPhone: row.payment_mcx_phone || undefined,
      paymentHolderName: row.payment_holder_name || undefined
    };
  },

  async saveSettings(settings: PlatformSettings): Promise<void> {
    const { error } = await db()
      .from('platform_settings')
      .upsert(
        {
          id: 1,
          brand_name: settings.brandName,
          support_email: settings.supportEmail,
          support_phone: settings.supportPhone,
          payment_iban: settings.paymentIban || null,
          payment_mcx_phone: settings.paymentMcxPhone || null,
          payment_holder_name: settings.paymentHolderName || null
        },
        { onConflict: 'id' }
      );
    if (error) throw new Error(`Não foi possível guardar as definições: ${errMsg(error)}`);
  }
};
