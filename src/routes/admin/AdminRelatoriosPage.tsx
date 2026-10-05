import React from 'react';
import { Download, BarChart3 } from 'lucide-react';
import { WeddingStorageService } from '../../services/weddingStorage';

/**
 * RELATÓRIOS (admin) — consolidação por evento com exportação CSV.
 */
export const AdminRelatoriosPage: React.FC = () => {
  const events = WeddingStorageService.getEvents();
  const guests = WeddingStorageService.getGuests();
  const couples = WeddingStorageService.getCouples();

  const rows = events.map((ev) => {
    const list = guests.filter((g) => g.eventId === ev.id);
    const confirmed = list.filter((g) => g.rsvpStatus === 'confirmed');
    const declined = list.filter((g) => g.rsvpStatus === 'declined');
    const pending = list.filter((g) => g.rsvpStatus === 'pending');
    const people = confirmed.reduce((acc, g) => acc + (g.confirmedGuests || 1), 0);
    const accesses = list.reduce((acc, g) => acc + (g.accessCount || 0), 0);
    const usedQr = list.filter((g) => g.qrStatus === 'used').length;
    const couple = couples.find((c) => c.id === ev.coupleId);
    return {
      event: ev,
      couple: couple?.name || '—',
      total: list.length,
      confirmed: confirmed.length,
      declined: declined.length,
      pending: pending.length,
      people,
      accesses,
      usedQr,
      rate: list.length ? Math.round((confirmed.length / list.length) * 100) : 0
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      confirmed: acc.confirmed + r.confirmed,
      declined: acc.declined + r.declined,
      pending: acc.pending + r.pending,
      people: acc.people + r.people,
      accesses: acc.accesses + r.accesses,
      usedQr: acc.usedQr + r.usedQr
    }),
    { total: 0, confirmed: 0, declined: 0, pending: 0, people: 0, accesses: 0, usedQr: 0 }
  );

  const exportCsv = () => {
    const header =
      'Evento,Casal,Cliente,Convidados,Confirmados,Recusas,Pendentes,Pessoas confirmadas,Convites abertos,QR utilizados,Taxa %\n';
    const body = rows
      .map((r) =>
        [
          `${r.event.brideName} & ${r.event.groomName}`,
          r.couple,
          r.total,
          r.confirmed,
          r.declined,
          r.pending,
          r.people,
          r.accesses,
          r.usedQr,
          r.rate
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-auranupcial.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Relatórios</h1>
          <p className="text-sm text-slate-500 mt-1">Indicadores consolidados por evento.</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Convidados', value: totals.total },
          { label: 'Confirmados', value: totals.confirmed },
          { label: 'Pessoas esperadas', value: totals.people },
          { label: 'Convites abertos', value: totals.accesses }
        ].map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-sm p-5">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">{k.label}</p>
            <p className="text-3xl font-semibold text-slate-900 mt-2">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[820px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2.5 px-5 font-medium">Evento</th>
              <th className="py-2.5 px-5 font-medium">Cliente</th>
              <th className="py-2.5 px-5 font-medium">Convidados</th>
              <th className="py-2.5 px-5 font-medium">Confirmados</th>
              <th className="py-2.5 px-5 font-medium">Recusas</th>
              <th className="py-2.5 px-5 font-medium">Pendentes</th>
              <th className="py-2.5 px-5 font-medium">Pessoas</th>
              <th className="py-2.5 px-5 font-medium">Aberturas</th>
              <th className="py-2.5 px-5 font-medium">QR</th>
              <th className="py-2.5 px-5 font-medium">Taxa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.event.id} className="hover:bg-slate-50">
                <td className="py-3 px-5 font-medium text-slate-800">
                  {r.event.brideName} & {r.event.groomName}
                </td>
                <td className="py-3 px-5 text-slate-600">{r.couple}</td>
                <td className="py-3 px-5 text-slate-600">{r.total}</td>
                <td className="py-3 px-5 text-emerald-700">{r.confirmed}</td>
                <td className="py-3 px-5 text-slate-600">{r.declined}</td>
                <td className="py-3 px-5 text-amber-700">{r.pending}</td>
                <td className="py-3 px-5 text-slate-600">{r.people}</td>
                <td className="py-3 px-5 text-slate-600">{r.accesses}</td>
                <td className="py-3 px-5 text-slate-600">{r.usedQr}</td>
                <td className="py-3 px-5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${r.rate}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{r.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-sm text-slate-400">
                  <BarChart3 className="w-4 h-4 inline mr-1.5 align-[-2px]" />
                  Sem eventos para reportar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
