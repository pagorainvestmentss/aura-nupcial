import React from 'react';
import { CheckCircle2, XCircle, Clock, Download, Users } from 'lucide-react';
import { useClientEvent } from './useClientEvent';

/**
 * CONFIRMAÇÕES (cliente) — RSVPs recebidos, com linguagem simples.
 */
export const ClientRsvpPage: React.FC = () => {
  const { event, guests } = useClientEvent();
  const [filter, setFilter] = React.useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');

  const filtered = guests.filter((g) => filter === 'all' || g.rsvpStatus === filter);
  const confirmed = guests.filter((g) => g.rsvpStatus === 'confirmed');
  const people = confirmed.reduce((acc, g) => acc + (g.confirmedGuests || 1), 0);

  const exportCsv = () => {
    const header = 'Convidado,Estado,Pessoas,Telefone,Resposta\n';
    const body = guests
      .map((g) =>
        [
          g.name,
          g.rsvpStatus,
          g.confirmedGuests || 1,
          g.phone || '',
          g.rsvpDate ? new Date(g.rsvpDate).toLocaleString('pt-PT') : ''
        ].join(',')
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'convites-confirmados.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!event) {
    return (
      <div className="bg-white border border-stone-200 rounded-xs p-8 text-center">
        <p className="text-sm text-stone-500 font-sans">A preparar as suas confirmações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-stone-400">
            Confirmações
          </p>
          <h1 className="font-serif text-3xl text-stone-900 mt-1">Quem já respondeu</h1>
          <p className="text-sm text-stone-600 font-sans mt-1">
            {confirmed.length} confirmaram · {people} pessoas esperadas.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xs p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-2xl font-serif text-stone-900">
              {guests.filter((g) => g.rsvpStatus === 'confirmed').length}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-sans">
              Confirmaram
            </p>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xs p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-stone-400" />
          <div>
            <p className="text-2xl font-serif text-stone-900">
              {guests.filter((g) => g.rsvpStatus === 'declined').length}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-sans">
              Não poderão vir
            </p>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xs p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-2xl font-serif text-stone-900">
              {guests.filter((g) => g.rsvpStatus === 'pending').length}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-sans">
              A aguardar
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['all', 'Todos'],
            ['confirmed', 'Confirmaram'],
            ['declined', 'Não poderão'],
            ['pending', 'A aguardar']
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold rounded-xs border transition-colors cursor-pointer ${
              filter === value
                ? 'bg-[#5E6B56] text-white border-[#5E6B56]'
                : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-xs divide-y divide-stone-100">
        {filtered.map((g) => (
          <div key={g.id} className="p-4 sm:p-5 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-stone-900 font-sans">{g.name}</p>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    g.rsvpStatus === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : g.rsvpStatus === 'declined'
                        ? 'bg-stone-100 text-stone-500 border-stone-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {g.rsvpStatus === 'confirmed'
                    ? 'Confirmou'
                    : g.rsvpStatus === 'declined'
                      ? 'Não pode'
                      : 'A aguardar'}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                {g.rsvpStatus === 'confirmed' && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {g.confirmedGuests || 1} pessoa(s)
                    {(g.companions || []).filter(Boolean).length > 0 && (
                      <span className="text-stone-400">
                        — {(g.companions || []).filter(Boolean).join(', ')}
                      </span>
                    )}
                  </span>
                )}
                {!!g.group && <span className="ml-2">· {g.group}</span>}
                {g.rsvpDate && (
                  <span className="ml-2">
                    · respondeu em {new Date(g.rsvpDate).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </p>
              {g.rsvpNotes && (
                <p className="text-xs text-stone-500 font-serif italic mt-1">
                  “{g.rsvpNotes}”
                </p>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-stone-400 font-sans">
            Nenhuma resposta neste filtro.
          </p>
        )}
      </div>
    </div>
  );
};
