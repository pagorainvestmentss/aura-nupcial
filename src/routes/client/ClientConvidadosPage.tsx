import React from 'react';
import { Plus, Pencil, Trash2, Copy, Check, Search, Users, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WeddingStorageService, generateRandomToken } from '../../services/weddingStorage';
import { Guest, SalutationType } from '../../types/wedding';
import { useClientEvent } from './useClientEvent';
import { canAddGuest, planGuestLimitLabel, PLAN_LABEL } from '../../data/site';
import { guestInviteMessage, whatsappShareLink } from '../../utils/whatsapp';

const EMPTY_FORM = {
  name: '',
  phone: '',
  relationship: '',
  salutationType: 'individual' as SalutationType,
  maxGuests: '1'
};

/**
 * CONVIDADOS (cliente) — adicionar, editar, remover e copiar o link de cada convite.
 */
export const ClientConvidadosPage: React.FC = () => {
  const [version, setVersion] = React.useState(0);
  const { couple, event, guests } = useClientEvent(version);
  const [query, setQuery] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Guest | null>(null);
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [copied, setCopied] = React.useState<string | null>(null);

  const refresh = () => setVersion((v) => v + 1);

  const plan = couple?.plan || 'starter';
  const atLimit = !canAddGuest(plan, guests.length);

  const filtered = guests.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  const inviteUrl = (token: string) =>
    event ? `${window.location.origin}${import.meta.env.BASE_URL}convite/${event.slug}/${token}` : '';

  const copyLink = (token: string) => {
    navigator.clipboard?.writeText(inviteUrl(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  /** Abre o WhatsApp com o convite do convidado — directo ao chat se tiver telefone. */
  const shareWhatsapp = (g: Guest) => {
    if (!event) return;
    const url = whatsappShareLink(g.phone, guestInviteMessage(event, g, inviteUrl(g.token)));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (g: Guest) => {
    setEditing(g);
    setForm({
      name: g.name,
      phone: g.phone || '',
      relationship: g.relationship || '',
      salutationType: g.salutationType,
      maxGuests: String(g.maxGuests || 1)
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !form.name.trim()) return;
    if (!editing && !canAddGuest(plan, guests.length)) return;

    if (editing) {
      WeddingStorageService.saveGuest({
        ...editing,
        name: form.name.trim(),
        phone: form.phone.trim(),
        relationship: form.relationship.trim(),
        salutationType: form.salutationType,
        maxGuests: Number(form.maxGuests) || 1
      });
    } else {
      const newGuest: Guest = {
        id: `guest-${Date.now()}`,
        eventId: event.id,
        name: form.name.trim(),
        salutationType: form.salutationType,
        relationship: form.relationship.trim(),
        phone: form.phone.trim(),
        token: generateRandomToken(
          form.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
        ),
        maxGuests: Number(form.maxGuests) || 1,
        confirmedGuests: 0,
        rsvpStatus: 'pending',
        accessCount: 0,
        qrStatus: 'active'
      };
      WeddingStorageService.saveGuest(newGuest);
    }

    setModalOpen(false);
    refresh();
  };

  const handleDelete = (g: Guest) => {
    if (!confirm(`Remover ${g.name} da lista de convidados?`)) return;
    WeddingStorageService.deleteGuest(g.id);
    refresh();
  };

  if (!event) {
    return (
      <div className="bg-white border border-stone-200 rounded-xs p-8 text-center">
        <p className="text-sm text-stone-500 font-sans">A preparar a sua lista...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-stone-400">Convidados</p>
          <h1 className="font-serif text-3xl text-stone-900 mt-1">A sua lista de convidados</h1>
          <p className="text-sm text-stone-600 font-sans mt-1">
            {guests.length} convidados · cada um tem um convite só dele.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <button
            onClick={openCreate}
            disabled={atLimit}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors ${
              atLimit
                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                : 'text-white bg-[#5E6B56] hover:bg-[#4E5B46] cursor-pointer'
            }`}
          >
            <Plus className="w-4 h-4" />
            Adicionar convidado
          </button>
          <p className="text-[11px] font-sans text-stone-500">
            {guests.length} · {planGuestLimitLabel(plan)}
          </p>
        </div>
      </div>

      {atLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xs px-4 py-3 flex flex-wrap items-center gap-3">
          <Users className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs font-sans text-amber-800 flex-1 min-w-52">
            Limite do plano {PLAN_LABEL[plan]} atingido ({planGuestLimitLabel(plan).toLowerCase()}).
            {plan === 'starter'
              ? ' Faça upgrade para o plano Pro e continue com mais espaço.'
              : ' Faça upgrade para o plano Premium e continue sem limites.'}
          </p>
          <Link
            to="/cliente"
            className="text-[11px] uppercase tracking-widest font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] px-3 py-2 rounded-xs transition-colors"
          >
            Ver planos
          </Link>
        </div>
      )}

      <div className="relative max-w-xs">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar convidado..."
          className="w-full pl-9 pr-3 py-2 text-sm font-sans bg-white border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
        />
      </div>

      <div className="bg-white border border-stone-200 rounded-xs divide-y divide-stone-100">
        {filtered.map((g) => (
          <div key={g.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-stone-900 font-sans">{g.name}</p>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    g.rsvpStatus === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : g.rsvpStatus === 'declined'
                        ? 'bg-stone-100 text-stone-500 border-stone-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {g.rsvpStatus === 'confirmed'
                    ? 'Confirmou'
                    : g.rsvpStatus === 'declined'
                      ? 'Não pode'
                      : 'A aguardar'}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                {[g.relationship, g.phone].filter(Boolean).join(' · ') || 'Sem contacto'} ·{' '}
                {g.maxGuests} lugar(es)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => copyLink(g.token)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 border border-stone-300 rounded-xs hover:bg-stone-50 cursor-pointer"
              >
                {copied === g.token ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copied === g.token ? 'Copiado' : 'Copiar link'}
              </button>
              <button
                onClick={() => shareWhatsapp(g)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#5E6B56] border border-[#5E6B56]/40 rounded-xs hover:bg-[#5E6B56]/10 cursor-pointer"
                title={g.phone ? `Enviar directo para ${g.phone}` : 'Abrir o WhatsApp para escolher o contacto'}
              >
                <MessageCircle className="w-3 h-3" />
                WhatsApp
              </button>
              <button
                onClick={() => openEdit(g)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 border border-stone-300 rounded-xs hover:bg-stone-50 cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(g)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 bg-red-50 rounded-xs hover:bg-red-100 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-stone-400 font-sans">
            Nenhum convidado encontrado. Comece por adicionar alguém!
          </p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xs p-6 max-w-md w-full shadow-xl">
            <h3 className="font-serif text-xl text-stone-900 mb-4">
              {editing ? 'Editar convidado' : 'Novo convidado'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                  Nome
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Família Silva"
                  className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                    Telefone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                    Lugares
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxGuests}
                    onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
                    className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                  Ligação (opcional)
                </label>
                <input
                  value={form.relationship}
                  onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                  placeholder="Ex: Amigos da faculdade"
                  className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer font-sans"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs uppercase tracking-widest font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
