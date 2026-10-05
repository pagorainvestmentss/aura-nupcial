import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { OCCASION_LIST } from '../data/occasions';
import { WHATSAPP_DISPLAY, whatsappLink } from '../data/site';

const NAV_LINKS = [
  { to: '/como-funciona', label: 'Como funciona' },
  { to: '/exemplos', label: 'Exemplos' },
  { to: '/pacotes', label: 'Pacotes' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contacto', label: 'Contacto' }
];

/**
 * Layout do SITE PÚBLICO — representa a MARCA da plataforma.
 * Nunca herda elementos do convite de casal nem dos painéis.
 */
export const PublicLayout: React.FC = () => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-800">
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg tracking-[0.25em] uppercase text-stone-900">
            Aura Nupcial
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[11px] uppercase tracking-[0.18em] font-sans font-medium">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `transition-colors ${
                    isActive ? 'text-[#5E6B56] border-b border-[#5E6B56]' : 'text-stone-500 hover:text-stone-900 border-b border-transparent'
                  } pb-0.5`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <button
                onClick={() => navigate(session.role === 'admin' ? '/admin' : '/cliente')}
                className="hidden sm:inline-flex px-4 py-2 text-[11px] uppercase tracking-widest font-sans font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer"
              >
                O meu painel
              </button>
            ) : (
              <>
                <Link
                  to="/criar"
                  className="hidden sm:inline-flex px-4 py-2 text-[11px] uppercase tracking-widest font-sans font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
                >
                  Criar convite
                </Link>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-[11px] uppercase tracking-widest font-sans font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
                >
                  Entrar
                </Link>
              </>
            )}
            {session && (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-block text-[11px] uppercase tracking-widest font-sans text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                Sair
              </button>
            )}
            <button
              className="md:hidden text-stone-700 cursor-pointer p-1"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menu"
            >
              <span className="block w-5 h-px bg-stone-800 mb-1.5" />
              <span className="block w-5 h-px bg-stone-800 mb-1.5" />
              <span className="block w-5 h-px bg-stone-800" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-stone-200 bg-[#FAF7F2] px-5 py-4 flex flex-col gap-3 text-[11px] uppercase tracking-[0.18em] font-sans font-medium">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="text-stone-600 hover:text-stone-900">
                {l.label}
              </Link>
            ))}
            <Link to="/criar" className="text-[#5E6B56] font-semibold">
              Criar convite
            </Link>
            <Link to="/login" className="text-stone-600 hover:text-stone-900">
              Entrar
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* WhatsApp flutuante */}
      <a
        href={whatsappLink('Olá! Gostaria de saber mais sobre os convites Aura Nupcial.')}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar por WhatsApp"
        className="fixed bottom-5 right-5 z-40 w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#5E6B56] text-white shadow-xl hover:bg-[#4E5B46] transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      <footer className="border-t border-stone-200 bg-[#F4EFE6]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-xs font-sans text-stone-600">
          <div>
            <p className="font-serif text-base tracking-[0.2em] uppercase text-stone-900 mb-2">
              Aura Nupcial
            </p>
            <p className="leading-relaxed">
              Convites digitais de autor para casamento, noivado, aniversário e
              celebrações. RSVP em tempo real e check-in por QR Code.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">
              Plataforma
            </span>
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-stone-900">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">
              Ocasiões
            </span>
            {OCCASION_LIST.map((o) => (
              <Link
                key={o.id}
                to={`/criar?ocasiao=${o.id}`}
                className="hover:text-stone-900"
              >
                Convite de {o.label.toLowerCase()}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">
              Acesso
            </span>
            <Link to="/criar" className="hover:text-stone-900">
              Criar convite
            </Link>
            <Link to="/login" className="hover:text-stone-900">
              Entrar na conta
            </Link>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:text-stone-900">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
            <Link to="/convite/mariana-pedro/8Fk92KsP" className="hover:text-stone-900">
              Ver convite de demonstração
            </Link>
          </div>
        </div>
        <div className="border-t border-stone-200 py-4 text-center text-[10px] uppercase tracking-[0.25em] text-stone-400 font-sans">
          © {new Date().getFullYear()} Aura Nupcial — Luanda · Lisboa
        </div>
      </footer>
    </div>
  );
};
