import React from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getRepo } from '../../services/repo';
import { Couple, PaymentStatus } from '../../types/wedding';
import { PLAN_LABEL } from '../../data/site';

const PAYMENT_META: Record<PaymentStatus, { label: string; tone: string; icon: React.ElementType }> = {
  paid: { label: 'Pago', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  pending: { label: 'Por pagar', tone: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  overdue: { label: 'Em atraso', tone: 'text-red-700 bg-red-50 border-red-200', icon: AlertCircle }
};

/**
 * PAGAMENTOS (admin) — estado financeiro por cliente.
 */
export const AdminPagamentosPage: React.FC = () => {
  const [couples, setCouples] = React.useState<Couple[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  React.useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const c = await getRepo().getCouples();
        if (activo) setCouples(c);
      } catch {
        if (activo) setErro('Não foi possível carregar os pagamentos. Tente novamente mais tarde.');
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const refresh = async () => {
    try {
      setCouples(await getRepo().getCouples());
      setErro(null);
    } catch {
      setErro('Não foi possível actualizar a lista de clientes.');
    }
  };

  const setPayment = async (couple: Couple, status: PaymentStatus) => {
    setSaving(couple.id);
    setErro(null);
    try {
      await getRepo().setPaymentStatus(couple.id, status);
      await refresh();
    } catch {
      setErro('Não foi possível actualizar o estado de pagamento.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div role="status" className="text-sm text-slate-500">
        A carregar dados…
      </div>
    );
  }

  const totals = {
    paid: couples.filter((c) => c.paymentStatus === 'paid').length,
    pending: couples.filter((c) => c.paymentStatus === 'pending').length,
    overdue: couples.filter((c) => c.paymentStatus === 'overdue').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pagamentos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Estado financeiro dos contratos por cliente. Os convites só ficam publicáveis após a
          confirmação do pagamento.
        </p>
      </div>

      {erro && (
        <p role="alert" className="text-xs text-red-600">
          {erro}
        </p>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-2xl font-semibold text-slate-900">{totals.paid}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Pagos</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-2xl font-semibold text-slate-900">{totals.pending}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Por pagar</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-2xl font-semibold text-slate-900">{totals.overdue}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Em atraso</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm divide-y divide-slate-100">
        {couples.map((c) => {
          const meta = PAYMENT_META[c.paymentStatus];
          const Icon = meta.icon;
          return (
            <div key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {c.email} · pacote {PLAN_LABEL[c.plan]}
                    {c.pendingPlan && c.pendingPlan !== c.plan
                      ? ` · ${PLAN_LABEL[c.pendingPlan]} pedido pelo cliente`
                      : ''}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border self-start ${meta.tone}`}
              >
                <Icon className="w-3 h-3" />
                {meta.label}
              </span>

              <div className="flex items-center gap-2">
                {((c.paymentStatus !== 'paid' || Boolean(c.pendingPlan)) && (
                  <button
                    disabled={saving === c.id}
                    onClick={() => setPayment(c, 'paid')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {c.pendingPlan && c.pendingPlan !== c.plan
                      ? 'Confirmar upgrade'
                      : 'Confirmar pagamento'}
                  </button>
                ))}
                {(['paid', 'pending', 'overdue'] as PaymentStatus[]).map((s) => (
                  <button
                    key={s}
                    disabled={c.paymentStatus === s || saving === c.id}
                    onClick={() => setPayment(c, s)}
                    className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                      c.paymentStatus === s
                        ? 'bg-slate-900 text-white border-slate-900 cursor-default'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    {PAYMENT_META[s].label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
