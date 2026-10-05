import React from 'react';
import { CheckCircle2, XCircle, Clock, Users, Download } from 'lucide-react';
import { WeddingStorageService } from '../../services/weddingStorage';

/**
 * RSVP (admin) — consolidação de respostas por evento.
 */
export const AdminRsvpPage: React.FC = () => {
  const [eventFilter, setEventFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const events = WeddingStorageService.getEvents();
  const guests = WeddingStorageService.getGuests();

  const filtered = guests.filter((g) => {
    if (eventFilter !== 'all' && g.eventId !== eventFilter) return false;
    if (statusFilter !== 'all' && g.rsvpStatus !== statusFilter) return false;
    return true;
  });

  const confirmedPeople = filtered
    .filter((g) => g.rsvpStatus === 'confirmed')
    .reduce((acc, g) => acc + (g.confirmedGuests || 1), 0);

  const exportCsv = () => {
    const header = 'Convidado,Evento,Telefone,Estado,Pessoas,Grupo,Acompanhantes\n';
    const rows = filtered
      .map((g) => {
        const ev = events.find((e) => e.id === g.eventId);
        const name = `${ev ? ev.brideName + ' & ' + ev.groomName : '-'}`;
        const companionNames = (g.companions || []).filter(Boolean).join('; ');
        return `${g.name},${name},${g.phone || ''},${g.rsvpStatus},${g.confirmedGuests || 1},${g.group || ''},"${companionNames}"`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rsvp-auranupcial.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">RSVP</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} respostas · {confirmedPeople} pessoas confirmadas.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
        >
          <option value="all">Todos os eventos</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.brideName} & {e.groomName}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm"
        >
          <option value="all">Todos os estados</option>
          <option value="confirmed">Confirmados</option>
          <option value="declined">Recusas</option>
          <option value="pending">Pendentes</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-2xl font-semibold text-slate-900">
              {filtered.filter((g) => g.rsvpStatus === 'confirmed').length}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Confirmados</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-stone-500" />
          <div>
            <p className="text-2xl font-semibold text-slate-900">
              {filtered.filter((g) => g.rsvpStatus === 'declined').length}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Recusas</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-2xl font-semibold text-slate-900">
              {filtered.filter((g) => g.rsvpStatus === 'pending').length}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Pendentes</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2.5 px-5 font-medium">Convidado</th>
              <th className="py-2.5 px-5 font-medium">Evento</th>
              <th className="py-2.5 px-5 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Pessoas
                </span>
              </th>
              <th className="py-2.5 px-5 font-medium">Estado</th>
              <th className="py-2.5 px-5 font-medium">Resposta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((g) => {
              const ev = events.find((e) => e.id === g.eventId);
              return (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-800">{g.name}</span>
                      {!!g.group && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-stone-200 bg-stone-50 text-stone-500">
                          {g.group}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-5 text-slate-600">
                    {ev ? `${ev.brideName} & ${ev.groomName}` : '—'}
                  </td>
                  <td className="py-3 px-5 text-slate-600">
                    {g.confirmedGuests || 1}
                    {(g.companions || []).filter(Boolean).length > 0 && (
                      <p className="text-xs text-slate-400">
                        {(g.companions || []).filter(Boolean).join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        g.rsvpStatus === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : g.rsvpStatus === 'declined'
                            ? 'bg-stone-100 text-stone-600 border-stone-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {g.rsvpStatus === 'confirmed'
                        ? 'Confirmado'
                        : g.rsvpStatus === 'declined'
                          ? 'Recusou'
                          : 'Pendente'}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-500 text-xs">
                    {g.rsvpDate ? new Date(g.rsvpDate).toLocaleString('pt-PT') : '—'}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                  Sem respostas para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
