import React from 'react';
import { Check, Palette } from 'lucide-react';
import { WeddingStorageService } from '../../services/weddingStorage';
import { WeddingEvent } from '../../types/wedding';

type TemplateId = WeddingEvent['templateId'];

interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  swatch: string[];
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: 'botanical-sage',
    name: 'Botânico Sálvia',
    description: 'Verdes suaves, ilustrações botânicas e papel quente. O clássico da casa.',
    swatch: ['#5E6B56', '#FAF7F2', '#A8B39A']
  },
  {
    id: 'elegance-terracotta',
    name: 'Elegância Terracota',
    description: 'Tons terrosos e minimalismo editorial para casamentos ao entardecer.',
    swatch: ['#B45F43', '#FBF3EC', '#E0A17E']
  },
  {
    id: 'classic-gold',
    name: 'Clássico Dourado',
    description: 'Dourado sobre marfim, serifas formais — cerimónias de gala.',
    swatch: ['#B08C4F', '#FDFBF6', '#E4D3A1']
  },
  {
    id: 'romance-rose',
    name: 'Romance Rosa',
    description: 'Rosa empoeirado e tipografia delicada para um tom intimista.',
    swatch: ['#C08497', '#FDF6F7', '#E9C6CE']
  }
];

/**
 * TEMPLATES (admin) — catálogo visual e atribuição a eventos.
 */
export const AdminTemplatesPage: React.FC = () => {
  const [events, setEvents] = React.useState<WeddingEvent[]>(() => WeddingStorageService.getEvents());

  const refresh = () => setEvents(WeddingStorageService.getEvents());

  const assignTemplate = (event: WeddingEvent, templateId: TemplateId) => {
    WeddingStorageService.saveEvent({ ...event, templateId });
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Templates</h1>
        <p className="text-sm text-slate-500 mt-1">
          {TEMPLATES.length} templates disponíveis · atribua um a cada evento.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TEMPLATES.map((t) => {
          const inUse = events.filter((e) => e.templateId === t.id);
          return (
            <div key={t.id} className="bg-white border border-slate-200 rounded-sm overflow-hidden">
              <div className="h-20 flex">
                {t.swatch.map((c) => (
                  <div key={c} className="flex-1" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-slate-400" />
                  <h3 className="font-medium text-slate-900">{t.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.description}</p>
                <p className="text-[11px] text-slate-400 mt-3">
                  {inUse.length > 0
                    ? `Em uso: ${inUse.map((e) => `${e.brideName} & ${e.groomName}`).join(', ')}`
                    : 'Ainda não atribuído a nenhum evento'}
                </p>
              </div>

              <div className="px-5 pb-5">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
                  Atribuir a um evento
                </p>
                <div className="flex flex-wrap gap-2">
                  {events.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => assignTemplate(e, t.id)}
                      disabled={e.templateId === t.id}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                        e.templateId === t.id
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default'
                          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      {e.templateId === t.id && <Check className="w-3 h-3" />}
                      {e.brideName} & {e.groomName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
