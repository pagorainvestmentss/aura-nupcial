import React from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle, XCircle, FileText } from 'lucide-react';
import { getRepo } from '../../services/repo';
import { useAuth } from '../../app/AuthContext';
import { Couple, PaymentRequest, PaymentStatus } from '../../types/wedding';
import { PLAN_LABEL, formatKz } from '../../data/site';

const PAYMENT_META: Record<PaymentStatus, { label: string; tone: string; icon: React.ElementType }> = {
  paid: { label: 'Pago', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  pending: { label: 'Por pagar', tone: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  overdue: { label: 'Em atraso', tone: 'text-red-700 bg-red-50 border-red-200', icon: AlertCircle }
};

const REQUEST_META: Record<PaymentRequest['status'], { label: string; tone: string; icon: React.ElementType }> = {
  paid: { label: 'Pago', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  pending: { label: 'Pendente', tone: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  cancelled: { label: 'Cancelado', tone: 'text-slate-500 bg-slate-50 border-slate-200', icon: XCircle }
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
}

/**
 * PAGAMENTOS (admin) — pedidos gerados pelos clientes (com referência) e
 * estado financeiro por cliente. Confirmar um pedido marca o pedido como pago
 * E desbloqueia o casal (activa upgrades pendentes) — tudo auditado.
 */
export const AdminPagamentosPage: React.FC = () => {
  const { session } = useAuth();
  const [couples, setCouples] = React.useState<Couple[]>([]);
  const [requests, setRequests] = React.useState<PaymentRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const [c, r] = await Promise.all([getRepo().getCouples(), getRepo().getPaymentRequests()]);
    setCouples(c);
    setRequests(r);
  }, []);

  React.useEffect(() => {
    let activo = true;
    (async () => {
      try {
        await load();
      } catch {
        if (activo) setErro('Não foi possível carregar os pagamentos. Tente novamente mais tarde.');
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [load]);

  const refresh = async () => {
    try {
      await load();
      setErro(null);
    } catch {
      setErro('Não foi possível actualizar a lista de pagamentos.');
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

  const processRequest = async (request: PaymentRequest, status: 'paid' | 'cancelled') => {
    setSaving(request.id);
    setErro(null);
    try {
      await getRepo().setPaymentRequestStatus(request.id, status, session?.email || undefined);
      await refresh();
    } catch {
      setErro('Não foi possível actualizar o pedido de pagamento.');
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

  const coupleName = (id: string) => couples.find((c) => c.id === id)?.name || '—';
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const revenue = requests
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + (r.amountKz || 0), 0);

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
          Pedidos gerados pelos clientes e estado financeiro por cliente. Os convites só ficam
          publicáveis após a confirmação do pagamento.
        </p>
      </div>

      {erro && (
        <p role="alert" className="text-xs text-red-600">
          {erro}
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-center gap-3">
          <FileText className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-2xl font-semibold text-slate-900">{pendingRequests.length}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Pedidos pendentes</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-2xl font-semibold text-slate-900">{totals.paid}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Clientes pagos</p>
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
          <CreditCard className="w-5 h-5 text-slate-600" />
          <div>
            <p className="text-2xl font-semibold text-slate-900">{formatKz(revenue)} Kz</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Receita confirmada</p>
          </div>
        </div>
      </div>

      {/* Pedidos de pagamento */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Pedidos de pagamento</h2>
        <p className="text-xs text-slate-500 mt-1">
          Cada pedido tem uma referência única gerada pelo cliente. Confirmar desbloqueia o casal
          e activa upgrades pendentes.
        </p>
        <div className="mt-3 bg-white border border-slate-200 rounded-sm divide-y divide-slate-100">
          {requests.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              Ainda não há pedidos de pagamento gerados pelos clientes.
            </p>
          ) : (
            requests.map((r) => {
              const meta = REQUEST_META[r.status];
              const Icon = meta.icon;
              return (
                <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {coupleName(r.coupleId)}{' '}
                        <span className="font-mono text-xs text-slate-500">({r.reference})</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {r.kind === 'upgrade' ? 'Upgrade' : 'Plano inicial'} · plano{' '}
                        {PLAN_LABEL[r.plan]} · {formatKz(r.amountKz)} Kz · criado{' '}
                        {formatDate(r.createdAt)}
                        {r.paidAt ? ` · pago ${formatDate(r.paidAt)}` : ''}
                        {r.confirmedBy ? ` · confirmado por ${r.confirmedBy}` : ''}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border self-start ${meta.tone}`}
                  >
                    <Icon className="w-3 h-3" />
                    {meta.label}
                  </span>

                  {r.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={saving === r.id}
                        onClick={() => processRequest(r, 'paid')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmar pago
                      </button>
                      <button
                        disabled={saving === r.id}
                        onClick={() => processRequest(r, 'cancelled')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <XCircle className="w-3 h-3" />
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Estado por cliente */}
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
