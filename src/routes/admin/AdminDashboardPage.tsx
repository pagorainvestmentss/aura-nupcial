import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  Send,
  UserRoundCheck,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode
} from 'lucide-react';
import { WeddingStorageService } from '../../services/weddingStorage';
import { Reveal } from '../../components/motion/Reveal';

/**
 * Dashboard do ADMIN — métricas globais da plataforma.
 * Sistema administrativo: nada de layout de casamento aqui.
 */
export const AdminDashboardPage: React.FC = () => {
  const couples = WeddingStorageService.getCouples();
  const events = WeddingStorageService.getEvents();
  const guests = WeddingStorageService.getGuests();

  const activeClients = couples.filter((c) => c.status === 'active').length;
  const activeEvents = events.filter((e) => e.status === 'active').length;
  const publishedInvites = events.filter((e) => e.status === 'active').length;
  const confirmed = guests.filter((g) => g.rsvpStatus === 'confirmed');
  const declined = guests.filter((g) => g.rsvpStatus === 'declined');
  const pending = guests.filter((g) => g.rsvpStatus === 'pending');
  const confirmedPeople = confirmed.reduce((acc, g) => acc + (g.confirmedGuests || 1), 0);
  const usedQr = guests.filter((g) => g.qrStatus === 'used').length;

  const kpis = [
    { label: 'Clientes activos', value: activeClients, sub: `${couples.length} no total`, icon: Users },
    { label: 'Eventos activos', value: activeEvents, sub: `${events.length} no total`, icon: CalendarDays },
    { label: 'Convites publicados', value: publishedInvites, sub: 'estado activo', icon: Send },
    { label: 'Total de convidados', value: guests.length, sub: 'todos os eventos', icon: UserRoundCheck }
  ];

  const rsvpKpis = [
    { label: 'Confirmados', value: confirmed.length, sub: `${confirmedPeople} pessoas`, icon: CheckCircle2, tone: 'text-emerald-700' },
    { label: 'Recusas', value: declined.length, sub: 'não comparecem', icon: XCircle, tone: 'text-stone-600' },
    { label: 'Pendentes', value: pending.length, sub: 'sem resposta', icon: Clock, tone: 'text-amber-700' },
    { label: 'QR utilizados', value: usedQr, sub: 'check-in efectuado', icon: QrCode, tone: 'text-slate-700' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão geral global da plataforma Aura Nupcial.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/clientes"
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 transition-colors"
          >
            + Novo cliente
          </Link>
          <Link
            to="/admin/eventos"
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 transition-colors"
          >
            + Novo evento
          </Link>
        </div>
      </div>

      {/* KPIs principais */}
      <Reveal className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-sm p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">{k.label}</span>
              <k.icon className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-2">{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </Reveal>

      {/* RSVP */}
      <Reveal className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {rsvpKpis.map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-sm p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.tone}`} />
            </div>
            <p className={`text-3xl font-semibold mt-2 ${k.tone}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </Reveal>

      {/* Eventos recentes */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Eventos na plataforma</h2>
          <Link to="/admin/eventos" className="text-xs text-slate-500 hover:text-slate-800">
            Ver todos →
          </Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2.5 px-5 font-medium">Casal</th>
              <th className="py-2.5 px-5 font-medium">Data</th>
              <th className="py-2.5 px-5 font-medium">Local</th>
              <th className="py-2.5 px-5 font-medium">Convidados</th>
              <th className="py-2.5 px-5 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((ev) => {
              const couple = couples.find((c) => c.id === ev.coupleId);
              const guestCount = guests.filter((g) => g.eventId === ev.id).length;
              return (
                <tr key={ev.id} className="hover:bg-slate-50">
                  <td className="py-3 px-5">
                    <span className="font-medium text-slate-800">
                      {ev.brideName} & {ev.groomName}
                    </span>
                    <span className="block text-[11px] text-slate-400">{couple?.name}</span>
                  </td>
                  <td className="py-3 px-5 text-slate-600">{ev.dateDisplay}</td>
                  <td className="py-3 px-5 text-slate-600">{ev.locationDisplay}</td>
                  <td className="py-3 px-5 text-slate-600">{guestCount}</td>
                  <td className="py-3 px-5">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        ev.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {ev.status === 'active' ? 'Publicado' : ev.status === 'draft' ? 'Rascunho' : ev.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
