import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home,
  MailOpen,
  Users,
  ClipboardCheck,
  Heart,
  LogOut,
  Eye
} from 'lucide-react';
import { useAuth } from '../app/AuthContext';
import { WeddingStorageService } from '../services/weddingStorage';
import { getOccasion } from '../data/occasions';

const CLIENT_NAV = (dadosLabel: string) => [
  { to: '/cliente', label: 'Visão geral', icon: Home, end: true },
  { to: '/cliente/convite', label: 'Meu convite', icon: MailOpen },
  { to: '/cliente/convidados', label: 'Convidados', icon: Users },
  { to: '/cliente/rsvp', label: 'Confirmações', icon: ClipboardCheck },
  { to: '/cliente/dados', label: dadosLabel, icon: Heart }
];

/**
 * Layout do CLIENTE (casal) — simples, leigo, sem jargão técnico.
 * Sem: tokens, API, logs, servidores, webhooks ou definições da plataforma.
 */
export const ClientLayout: React.FC = () => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const couple = React.useMemo(() => {
    if (!session?.coupleId) return null;
    return WeddingStorageService.getCoupleById(session.coupleId) || null;
  }, [session]);

  const event = React.useMemo(() => {
    if (!couple) return null;
    return (
      WeddingStorageService.getEventById(couple.activeEventId) ||
      WeddingStorageService.getEvents().find((e) => e.coupleId === couple.id) ||
      null
    );
  }, [couple]);

  const occasion = React.useMemo(() => getOccasion(event?.occasion), [event?.occasion]);
  const navItems = React.useMemo(() => CLIENT_NAV(occasion.labels.navData), [occasion]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openInvitation = () => {
    if (!event) return;
    const guests = WeddingStorageService.getGuestsByEventId(event.id);
    const token = guests[0]?.token;
    if (token) navigate(`/convite/${event.slug}/${token}`);
    else navigate('/cliente/convite');
  };

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-stone-800 font-sans">
      <div className="flex min-h-screen">
        {/* Sidebar do casal */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-[#FAF7F2] border-r border-stone-200 flex flex-col transform transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 flex items-center px-5 border-b border-stone-200">
            <span className="text-sm tracking-[0.25em] uppercase font-serif text-stone-900">
              Aura Nupcial
            </span>
          </div>

          <div className="px-5 py-4 border-b border-stone-200">
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
              {occasion.labels.clientArea}
            </p>
            <p className="font-serif text-lg text-stone-900 leading-tight">{couple?.name}</p>
            {event && (
              <p className="text-[11px] text-stone-500 mt-0.5">{event.dateDisplay}</p>
            )}
          </div>

          <nav className="flex-1 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 text-[13px] transition-colors ${
                    isActive
                      ? 'bg-white text-[#4E5B46] border-l-2 border-[#5E6B56] font-medium shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-white/60 border-l-2 border-transparent'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-stone-200 p-4 space-y-2">
            {event && (
              <button
                onClick={openInvitation}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-widest font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer justify-center"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver convite
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-[11px] uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors cursor-pointer justify-center"
            >
              <LogOut className="w-3.5 h-3.5" />
              Terminar sessão
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-16 bg-[#FAF7F2] border-b border-stone-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-stone-600 cursor-pointer"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <span className="block w-5 h-px bg-stone-700 mb-1.5" />
                <span className="block w-5 h-px bg-stone-700 mb-1.5" />
                <span className="block w-5 h-px bg-stone-700" />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
                  Bem-vindos de volta
                </p>
                <p className="text-sm font-medium text-stone-800">{session?.displayName}</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[11px] uppercase tracking-widest bg-[#EAE3D5] text-[#5E6B56] px-2.5 py-1 rounded-sm">
              {occasion.labels.areaShort}
            </span>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
