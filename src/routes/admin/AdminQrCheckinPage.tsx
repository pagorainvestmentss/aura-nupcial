import React from 'react';
import { ScanLine, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { WeddingStorageService } from '../../services/weddingStorage';
import { Guest, WeddingEvent } from '../../types/wedding';

/**
 * QR CHECK-IN (admin) — terminal de validação na portaria.
 */
export const AdminQrCheckinPage: React.FC = () => {
  const [qrInputToken, setQrInputToken] = React.useState('');
  const [scanResult, setScanResult] = React.useState<{
    valid: boolean;
    status: 'VALID' | 'ALREADY_USED' | 'NOT_FOUND' | 'REVOKED';
    message: string;
    guest?: Guest;
    event?: WeddingEvent;
  } | null>(null);

  const guests = WeddingStorageService.getGuests();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInputToken.trim()) return;
    const result = WeddingStorageService.validateQrCheckIn(qrInputToken.trim());
    setScanResult(result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">QR Check-in</h1>
        <p className="text-sm text-slate-500 mt-1">
          Validação de passes na entrada do evento. {guests.filter((g) => g.qrStatus === 'used').length}{' '}
          QR já validados.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 max-w-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <ScanLine className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Terminal de Validação</h2>
          <p className="text-xs text-slate-500 mt-1">
            Insira o token do convidado (ou o link completo) para validar a entrada.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Testar com:</span>
          {guests.slice(0, 3).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setQrInputToken(g.token)}
              className="px-2.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 rounded-sm hover:bg-slate-100 cursor-pointer text-slate-700"
            >
              {g.name}: {g.token}
            </button>
          ))}
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-medium text-slate-600 mb-1">
              Token ou código QR escaneado
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrInputToken}
                onChange={(e) => setQrInputToken(e.target.value)}
                placeholder="Ex: 8Fk92KsP ou cole a URL"
                className="flex-1 py-2.5 px-3 text-sm font-mono bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-2.5 text-xs uppercase tracking-widest font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-sm cursor-pointer"
              >
                Validar
              </button>
            </div>
          </div>
        </form>

        {scanResult && (
          <div
            className={`mt-6 p-6 rounded-sm border text-center ${
              scanResult.status === 'VALID'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : scanResult.status === 'ALREADY_USED'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              {scanResult.status === 'VALID' && <CheckCircle2 className="w-8 h-8 text-emerald-700" />}
              {scanResult.status === 'ALREADY_USED' && <Clock className="w-8 h-8 text-amber-700" />}
              {(scanResult.status === 'NOT_FOUND' || scanResult.status === 'REVOKED') && (
                <XCircle className="w-8 h-8 text-red-700" />
              )}
            </div>

            <h3 className="text-lg font-semibold">
              {scanResult.status === 'VALID'
                ? 'VÁLIDO · ENTRADA AUTORIZADA'
                : scanResult.status === 'ALREADY_USED'
                  ? 'JÁ UTILIZADO'
                  : scanResult.status === 'REVOKED'
                    ? 'PASSO REVOGADO'
                    : 'PASSO NÃO ENCONTRADO'}
            </h3>
            <p className="text-sm mt-1">{scanResult.message}</p>

            {scanResult.guest && (
              <div className="mt-4 pt-4 border-t border-black/10 text-sm space-y-1">
                <p className="font-medium">{scanResult.guest.name}</p>
                {scanResult.event && (
                  <p className="text-xs opacity-70">
                    {scanResult.event.brideName} & {scanResult.event.groomName} ·{' '}
                    {scanResult.event.dateDisplay}
                  </p>
                )}
                <p className="text-xs opacity-70">
                  Pessoas: {scanResult.guest.confirmedGuests || 1} · RSVP:{' '}
                  {scanResult.guest.rsvpStatus === 'confirmed' ? 'Confirmado' : scanResult.guest.rsvpStatus}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
