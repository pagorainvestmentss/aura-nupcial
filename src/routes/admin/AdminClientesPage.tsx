import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Ban, CheckCircle2, CalendarDays, Search } from 'lucide-react';
import { WeddingStorageService } from '../../services/weddingStorage';
import { getOccasion, eventNames, fallbackNames } from '../../data/occasions';
import { Couple, PlanId } from '../../types/wedding';

/**
 * CLIENTES (admin) — criar, editar, visualizar, suspender, activar, consultar eventos.
 */
export const AdminClientesPage: React.FC = () => {
  const [couples, setCouples] = React.useState<Couple[]>(() => WeddingStorageService.getCouples());
  const [query, setQuery] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Couple | null>(null);
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    plan: 'starter' as PlanId,
    password: ''
  });

  const events = WeddingStorageService.getEvents();
  const guests = WeddingStorageService.getGuests();

  const refresh = () => setCouples(WeddingStorageService.getCouples());

  const filtered = couples.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', plan: 'starter', password: '' });
    setModalOpen(true);
  };

  const openEdit = (c: Couple) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, plan: c.plan, password: c.password });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      WeddingStorageService.saveCouple({
        ...editing,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        plan: form.plan,
        password: form.password
      });
    } else {
      const id = `couple-${Date.now()}`;
      const newCouple: Couple = {
        id,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
        plan: form.plan,
        activeEventId: '',
        status: 'active',
        paymentStatus: 'pending',
        password: form.password
      };
      WeddingStorageService.saveCouple(newCouple);
    }
    setModalOpen(false);
    refresh();
  };

  const toggleStatus = (c: Couple) => {
    const next = c.status === 'active' ? 'suspended' : 'active';
    WeddingStorageService.setClientStatus(c.id, next);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {couples.length} clientes registados na plataforma.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Criar cliente
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar nome ou email..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-sm divide-y divide-slate-100">
        {filtered.map((c) => {
          const clientEvents = events.filter((e) => e.coupleId === c.id);
          const clientGuests = guests.filter((g) => clientEvents.some((e) => e.id === g.eventId));
          return (
            <div key={c.id} className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-slate-900">{c.name}</h3>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      c.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}
                  >
                    {c.status === 'active' ? 'Activo' : 'Suspenso'}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200">
                    {c.plan}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  {c.email} · {c.phone}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3" />
                  {clientEvents.length} evento(s) · {clientGuests.length} convidado(s) · cliente desde{' '}
                  {c.createdAt}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {clientEvents.map((ev) => (
                  <span
                    key={ev.id}
                    className="text-[11px] px-2 py-1 bg-slate-100 text-slate-600 rounded-sm"
                  >
                    {getOccasion(ev.occasion).label} ·{' '}
                    {eventNames(ev) || fallbackNames(ev.occasion)} ({ev.status === 'active' ? 'pub.' : 'rascunho'})
                  </span>
                ))}
                <button
                  onClick={() => openEdit(c)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => toggleStatus(c)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border cursor-pointer transition-colors ${
                    c.status === 'active'
                      ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                      : 'text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {c.status === 'active' ? (
                    <>
                      <Ban className="w-3 h-3" />
                      Suspender
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Activar
                    </>
                  )}
                </button>
                <Link
                  to="/admin/eventos"
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Ver eventos
                </Link>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-400">Nenhum cliente encontrado.</p>
        )}
      </div>

      {/* Modal criar/editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editing ? 'Editar cliente' : 'Novo cliente'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                  Nome da conta
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Ana & Carlos ou Família Silva"
                  className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    Telefone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    Pacote
                  </label>
                  <select
                    value={form.plan}
                    onChange={(e) => setForm({ ...form, plan: e.target.value as PlanId })}
                    className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                    Palavra-passe (opcional)
                  </label>
                  <input
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="O cliente entra só com email"
                    className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
                  />
                </div>
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
