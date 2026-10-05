import React from 'react';
import { Search, QrCode, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { WeddingStorageService } from '../../services/weddingStorage';

/**
 * CONVIDADOS (admin) — vista global de todos os eventos, pesquisa, token e QR.
 */
export const AdminConvidadosPage: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [eventFilter, setEventFilter] = React.useState('all');
  const [copied, setCopied] = React.useState<string | null>(null);
  const [showQr, setShowQr] = React.useState<{ name: string; url: string } | null>(null);

  const events = WeddingStorageService.getEvents();
  const couples = WeddingStorageService.getCouples();
  const guests = WeddingStorageService.getGuests();

  const filtered = guests.filter((g) => {
    const ev = events.find((e) => e.id === g.eventId);
    if (eventFilter !== 'all' && g.eventId !== eventFilter) return false;
    return (
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      (g.phone || '').includes(query) ||
      (ev && ev.slug.includes(query.toLowerCase()))
    );
  });

  const inviteUrl = (guestToken: string) => {
    const ev = events.find((e) => guests.some((g) => g.eventId === e.id && g.token === guestToken));
    if (!ev) return '';
    return `${window.location.origin}/convite/${ev.slug}/${guestToken}`;
  };

  const copyLink = (token: string) => {
    navigator.clipboard?.writeText(inviteUrl(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const statusLabel = (s: string) =>
    s === 'confirmed' ? 'Confirmado' : s === 'declined' ? 'Recusou' : 'Pendente';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Convidados</h1>
        <p className="text-sm text-slate-500 mt-1">
          {guests.length} convidados em {events.length} eventos.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar nome, telefone ou slug..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500"
          />
        </div>
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
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[760px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2.5 px-5 font-medium">Convidado</th>
              <th className="py-2.5 px-5 font-medium">Evento</th>
              <th className="py-2.5 px-5 font-medium">Acompanhantes</th>
              <th className="py-2.5 px-5 font-medium">RSVP</th>
              <th className="py-2.5 px-5 font-medium">QR</th>
              <th className="py-2.5 px-5 font-medium text-right">Link individual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((g) => {
              const ev = events.find((e) => e.id === g.eventId);
              const couple = ev && couples.find((c) => c.id === ev.coupleId);
              return (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="py-3 px-5">
                    <span className="font-medium text-slate-800">{g.name}</span>
                    <span className="block text-[11px] text-slate-400">{g.phone}</span>
                  </td>
                  <td className="py-3 px-5 text-slate-600">
                    {ev ? `${ev.brideName} & ${ev.groomName}` : '—'}
                    <span className="block text-[11px] text-slate-400">{couple?.name}</span>
                  </td>
                  <td className="py-3 px-5 text-slate-600">{g.confirmedGuests || 1}</td>
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
                      {statusLabel(g.rsvpStatus)}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-600">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        g.qrStatus === 'used'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {g.qrStatus === 'used' ? 'Utilizado' : 'Por usar'}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => copyLink(g.token)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-slate-600 border border-slate-300 rounded-sm hover:bg-slate-50 cursor-pointer"
                        title="Copiar link do convite"
                      >
                        {copied === g.token ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Copiar
                      </button>
                      <button
                        onClick={() => setShowQr({ name: g.name, url: inviteUrl(g.token) })}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-slate-600 border border-slate-300 rounded-sm hover:bg-slate-50 cursor-pointer"
                        title="Ver QR code"
                      >
                        <QrCode className="w-3 h-3" />
                        QR
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                  Nenhum convidado encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showQr && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowQr(null)}
        >
          <div
            className="bg-white rounded-sm p-6 max-w-sm w-full shadow-xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">{showQr.name}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 break-all">{showQr.url}</p>
            <div className="my-5 flex justify-center">
              <QrCodePanel url={showQr.url} />
            </div>
            <button
              onClick={() => setShowQr(null)}
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * QR gerado localmente com a lib `qrcode` (mesma usada no convite).
 */
const QrCodePanel: React.FC<{ url: string }> = ({ url }) => {
  const [dataUrl, setDataUrl] = React.useState('');

  React.useEffect(() => {
    QRCode.toDataURL(url, { width: 220, margin: 1, color: { dark: '#1E293B', light: '#FFFFFF' } })
      .then(setDataUrl)
      .catch((err) => console.error('Erro ao gerar QR:', err));
  }, [url]);

  if (!dataUrl) {
    return <div className="w-[220px] h-[220px] animate-pulse bg-slate-100 rounded-sm" />;
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code do convite"
      className="border border-slate-200 rounded-sm"
      width={220}
      height={220}
    />
  );
};
