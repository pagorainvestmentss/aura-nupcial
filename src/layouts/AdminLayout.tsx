import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserRoundCheck,
  ClipboardCheck,
  LayoutTemplate,
  CreditCard,
  BarChart3,
  Settings,
  ScanLine,
  LogOut
} from 'lucide-react';
import { useAuth } from '../app/AuthContext';

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
  { to: '/admin/convidados', label: 'Convidados', icon: UserRoundCheck },
  { to: '/admin/rsvp', label: 'RSVP', icon: ClipboardCheck },
  { to: '/admin/qr-checkin', label: 'QR Check-in', icon: ScanLine },
  { to: '/admin/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/admin/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings }
];

/**
 * Layout do ADMINISTRADOR — sistema administrativo multi-cliente.
 * Linguagem funcional, densa e neutra. NUNCA parece uma página de casamento.
 */
export const AdminLayout: React.FC = () => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transform transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 flex items-center px-5 border-b border-slate-800">
            <span className="text-sm tracking-[0.2em] uppercase font-serif text-white">
              Aura Nupcial
            </span>
            <span className="ml-2 text-[9px] uppercase tracking-widest bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-sm">
              Admin
            </span>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-2.5 text-[13px] transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white border-l-2 border-[#8FA086]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-l-2 border-transparent'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <p className="text-[11px] text-slate-400 truncate">{session?.email}</p>
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Terminar sessão
            </button>
          </div>
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="backdrop-sidebar"
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 1, 1] }}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-slate-600 cursor-pointer"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <span className="block w-5 h-px bg-slate-700 mb-1.5" />
                <span className="block w-5 h-px bg-slate-700 mb-1.5" />
                <span className="block w-5 h-px bg-slate-700" />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Painel Administrativo
                </p>
                <p className="text-sm font-medium text-slate-800">Proprietário da plataforma</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-[11px] uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-sm">
              Ambiente Admin
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
