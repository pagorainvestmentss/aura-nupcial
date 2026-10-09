import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, Eye, EyeOff, Trash2 } from 'lucide-react';
import { WeddingStorageService } from '../../services/weddingStorage';
import { DEFAULT_EVENT } from '../../data/defaultWeddingData';
import { getOccasion, eventNames, fallbackNames } from '../../data/occasions';
import { OccasionId, WeddingEvent } from '../../types/wedding';

/**
 * EVENTOS (admin) — criar, editar estado, publicar/despublicar, associar a cliente.
 */
export const AdminEventosPage: React.FC = () => {
  const [events, setEvents] = React.useState<WeddingEvent[]>(() => WeddingStorageService.getEvents());
  const [modalOpen, setModalOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    coupleId: '',
    occasion: 'casamento' as OccasionId,
    brideName: '',
    groomName: '',
    dateIso: '',
    dateDisplay: '',
    locationDisplay: ''
  });

  const couples = WeddingStorageService.getCouples();
  const guests = WeddingStorageService.getGuests();

  const refresh = () => setEvents(WeddingStorageService.getEvents());

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const couple = couples.find((c) => c.id === form.coupleId);
    if (!couple) return;

    const slugBase = slugify(`${form.brideName}-${form.groomName}`) || `evento-${Date.now()}`;
    const slug = events.some((ev) => ev.slug === slugBase) ? `${slugBase}-${Date.now()}` : slugBase;

    const newEvent: WeddingEvent = {
      ...DEFAULT_EVENT,
      id: `event-${Date.now()}`,
      coupleId: couple.id,
      slug,
      occasion: form.occasion,
      brideName: form.brideName.trim(),
      groomName: form.groomName.trim(),
      dateIso: form.dateIso || DEFAULT_EVENT.dateIso,
      dateDisplay: form.dateDisplay.trim() || DEFAULT_EVENT.dateDisplay,
      locationDisplay: form.locationDisplay.trim() || DEFAULT_EVENT.locationDisplay,
      status: 'draft'
    };

    WeddingStorageService.saveEvent(newEvent);
    couple.activeEventId = newEvent.id;
    WeddingStorageService.saveCouple(couple);
    setModalOpen(false);
    refresh();
  };

  const togglePublish = (ev: WeddingEvent) => {
    WeddingStorageService.setEventStatus(ev.id, ev.status === 'active' ? 'draft' : 'active');
    refresh();
  };

  const handleDelete = (ev: WeddingEvent) => {
    if (!confirm(`Remover o evento "${eventNames(ev) || ev.slug}"?`)) return;
    WeddingStorageService.deleteEvent(ev.id);
    refresh();
  };

  const firstGuestToken = (eventId: string) =>
    guests.find((g) => g.eventId === eventId)?.token || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Eventos</h1>
          <p className="text-sm text-slate-500 mt-1">
            {events.length} eventos · {events.filter((e) => e.status === 'active').length} publicados.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({
              coupleId: couples[0]?.id || '',
              occasion: 'casamento',
              brideName: '',
              groomName: '',
              dateIso: '',
              dateDisplay: '',
              locationDisplay: ''
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Criar evento
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {events.map((ev) => {
          const couple = couples.find((c) => c.id === ev.coupleId);
          const occasion = getOccasion(ev.occasion);
          const count = guests.filter((g) => g.eventId === ev.id).length;
          const token = firstGuestToken(ev.id);
          return (
            <div key={ev.id} className="bg-white border border-slate-200 rounded-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {eventNames(ev) || fallbackNames(ev.occasion)}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    cliente: {couple?.name || '—'} · {occasion.label} · /convite/{ev.slug}
                  </p>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border ${
                    ev.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {ev.status === 'active' ? 'Publicado' : ev.status === 'draft' ? 'Rascunho' : ev.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
                <span>
                  <strong className="text-slate-700 block text-xs">{ev.dateDisplay}</strong> data
                </span>
                <span>
                  <strong className="text-slate-700 block text-xs">{ev.locationDisplay}</strong> local
                </span>
                <span>
                  <strong className="text-slate-700 block text-xs">{count}</strong> convidados
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => togglePublish(ev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border cursor-pointer transition-colors ${
                    ev.status === 'active'
                      ? 'text-slate-600 border-slate-300 bg-white hover:bg-slate-50'
                      : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {ev.status === 'active' ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      Despublicar
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      Publicar
                    </>
                  )}
                </button>

                {token && ev.status === 'active' && (
                  <Link
                    to={`/convite/${ev.slug}/${token}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-sm hover:bg-slate-50"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver convite
                  </Link>
                )}

                <button
                  onClick={() => handleDelete(ev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 bg-red-50 rounded-sm hover:bg-red-100 cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Novo evento</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                  Cliente (casal)
                </label>
                <select
                  required
                  value={form.coupleId}
                  onChange={(e) => setForm({ ...form, coupleId: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                >
                  <option value="">Seleccione o cliente...</option>
                  {couples.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                  Ocasião
                </label>
                <select
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value as OccasionId })}
                  className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                >
                  <option value="casamento">Casamento</option>
                  <option value="noivado">Noivado</option>
                  <option value="aniversario">Aniversário</option>
                  <option value="outra">Outra celebração</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    {getOccasion(form.occasion).labels.person1}
                  </label>
                  <input
                    required
                    value={form.brideName}
                    onChange={(e) => setForm({ ...form, brideName: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    {getOccasion(form.occasion).labels.person2}
                  </label>
                  <input
                    required
                    value={form.groomName}
                    onChange={(e) => setForm({ ...form, groomName: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={form.dateIso}
                    onChange={(e) => setForm({ ...form, dateIso: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    Data (texto)
                  </label>
                  <input
                    value={form.dateDisplay}
                    onChange={(e) => setForm({ ...form, dateDisplay: e.target.value })}
                    placeholder="Ex: 10 JUNHO 2027"
                    className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                  Localização
                </label>
                <input
                  value={form.locationDisplay}
                  onChange={(e) => setForm({ ...form, locationDisplay: e.target.value })}
                  placeholder="Ex: LUANDA — ANGOLA"
                  className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 cursor-pointer"
                >
                  Criar evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
