import React from 'react';
import { Save, Settings2, CreditCard } from 'lucide-react';
import { getRepo, PlatformSettings } from '../../services/repo';
import { useAuth } from '../../app/AuthContext';

/**
 * CONFIGURAÇÕES (admin) — identidade da plataforma, contactos e dados de
 * pagamento mostrados aos clientes (IBAN + Multicaixa Express).
 */
export const AdminConfiguracoesPage: React.FC = () => {
  const { session } = useAuth();
  const [settings, setSettings] = React.useState<PlatformSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const s = await getRepo().getSettings();
        if (activo) setSettings(s);
      } catch {
        if (activo) setErro('Não foi possível carregar as definições. Tente novamente mais tarde.');
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setBusy(true);
    setErro(null);
    try {
      await getRepo().saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setErro('Não foi possível guardar as definições. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !settings) {
    return (
      <div role="status" className="text-sm text-slate-500">
        A carregar dados…
      </div>
    );
  }

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

          <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800">Dados de pagamento</h2>
          </div>
          <p className="text-xs text-slate-500 -mt-2">
            Mostrados ao cliente no painel de pagamento (pedidos com referência). Preencha depois
            de configurar a conta bancária ou o número Multicaixa Express.
          </p>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
              IBAN
            </label>
            <input
              value={settings.paymentIban || ''}
              placeholder="AO06.0040.0000.8123.4567.1010.2"
              onChange={(e) => setSettings({ ...settings, paymentIban: e.target.value })}
              className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500 font-mono"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                Multicaixa Express
              </label>
              <input
                value={settings.paymentMcxPhone || ''}
                placeholder="+244 9XX XXX XXX"
                onChange={(e) => setSettings({ ...settings, paymentMcxPhone: e.target.value })}
                className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                Titular
              </label>
              <input
                value={settings.paymentHolderName || ''}
                placeholder="Nome do titular da conta"
                onChange={(e) => setSettings({ ...settings, paymentHolderName: e.target.value })}
                className="w-full py-2 px-3 text-sm bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {busy ? 'A guardar…' : 'Guardar'}
            </button>
            {saved && (
              <span className="text-xs text-emerald-700">Guardado com sucesso.</span>
            )}
            {erro && (
              <span role="alert" className="text-xs text-red-600">
                {erro}
              </span>
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
    </div>
  );
};
