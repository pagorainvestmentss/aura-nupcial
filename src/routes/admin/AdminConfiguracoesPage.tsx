import React from 'react';
import { Save, RotateCcw, Settings2 } from 'lucide-react';
import { WeddingStorageService } from '../../services/weddingStorage';
import { useAuth } from '../../app/AuthContext';

/**
 * CONFIGURAÇÕES (admin) — identidade da plataforma, contactos e manutenção.
 */
export const AdminConfiguracoesPage: React.FC = () => {
  const { session } = useAuth();
  const [settings, setSettings] = React.useState(() => WeddingStorageService.getSettings());
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    WeddingStorageService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (!confirm('Repor todos os dados de demonstração? As alterações locais serão perdidas.'))
      return;
    WeddingStorageService.resetToSeed();
    setSettings(WeddingStorageService.getSettings());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500 mt-1">Definições globais da plataforma.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Settings2 className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-800">Identidade e contactos</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
              Nome da marca
            </label>
            <input
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                Email de suporte
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                Telefone de suporte
              </label>
              <input
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            {saved && (
              <span className="text-xs text-emerald-700">Guardado com sucesso.</span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-1">Sessão actual</h2>
        <p className="text-sm text-slate-500">
          {session?.email} · perfil {session?.role}
        </p>
      </div>

      <div className="bg-white border border-red-200 rounded-sm p-6">
        <h2 className="text-sm font-semibold text-red-700 mb-1">Manutenção</h2>
        <p className="text-sm text-slate-500 mb-4">
          Repõe o estado inicial de demonstração (clientes, eventos, convidados e RSVPs).
        </p>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-sm hover:bg-red-100 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Repor dados de demonstração
        </button>
      </div>
    </div>
  );
};
