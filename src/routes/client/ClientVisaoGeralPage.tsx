import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Heart,
  ArrowRight,
  Circle,
  Rocket,
  CreditCard,
  UserPlus,
  PenLine
} from 'lucide-react';
import { useClientEvent } from './useClientEvent';
import { getRepo } from '../../services/repo';
import { eventNames, getOccasion } from '../../data/occasions';
import { planGuestLimitLabel, PLAN_LABEL, PLAN_GUEST_LIMIT, PLAN_PRICE_KZ, formatKz, isUpgrade, whatsappLink } from '../../data/site';
import { PaymentRequest, PlanId } from '../../types/wedding';
import { PlatformSettings } from '../../services/repository';
import { Reveal } from '../../components/motion/Reveal';

/**
 * VISÃO GERAL (cliente) — primeiros passos, plano e respostas, em linguagem simples.
 */
export const ClientVisaoGeralPage: React.FC = () => {
  const [version, setVersion] = React.useState(0);
  const { couple, event, guests, loading } = useClientEvent(version);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [requests, setRequests] = React.useState<PaymentRequest[]>([]);
  const [settings, setSettings] = React.useState<PlatformSettings | null>(null);
  const [copied, setCopied] = React.useState(false);
  const refresh = () => setVersion((v) => v + 1);

  React.useEffect(() => {
    let cancelled = false;
    if (!couple) return;
    getRepo()
      .getPaymentRequests(couple.id)
      .then((r) => !cancelled && setRequests(r))
      .catch(() => {});
    getRepo()
      .getSettings()
      .then((s) => !cancelled && setSettings(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [couple?.id, version]);

  const confirmed = guests.filter((g) => g.rsvpStatus === 'confirmed');
  const declined = guests.filter((g) => g.rsvpStatus === 'declined');
  const pending = guests.filter((g) => g.rsvpStatus === 'pending');
  const people = confirmed.reduce((acc, g) => acc + (g.confirmedGuests || 1), 0);
  const opened = guests.reduce((acc, g) => acc + (g.accessCount || 0), 0);

  const switchPlan = async (plan: PlanId) => {
    if (!couple) return;
    const upgrade = isUpgrade(couple.plan, plan) && couple.pendingPlan !== plan;
    const sameRankOrHigher = plan === couple.plan || isUpgrade(plan, couple.plan);
    if (!upgrade && sameRankOrHigher) return;
    const msg = upgrade
      ? `Pedir o upgrade para o plano ${PLAN_LABEL[plan]} (${planGuestLimitLabel(plan)})? Vamos gerar um pedido de pagamento pela diferença — assim que a equipa confirmar, o plano é actualizado.`
      : `Mudar para o plano ${PLAN_LABEL[plan]} (${planGuestLimitLabel(plan)})?`;
    if (!confirm(msg)) return;
    setBusy(true);
    setError(null);
    try {
      await getRepo().requestPlanChange(couple.id, plan);
      if (upgrade) {
        const alreadyRequested = requests.some(
          (r) => r.status === 'pending' && r.kind === 'upgrade' && r.plan === plan
        );
        if (!alreadyRequested) {
          await getRepo().createPaymentRequest({
            coupleId: couple.id,
            plan,
            kind: 'upgrade',
            amountKz: PLAN_PRICE_KZ[plan] - PLAN_PRICE_KZ[couple.plan]
          });
        }
      }
      refresh();
    } catch {
      setError('Não foi possível pedir a mudança de plano. Verifique a sua ligação e tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  const createInitialRequest = async () => {
    if (!couple) return;
    const alreadyRequested = requests.some(
      (r) => r.status === 'pending' && r.kind === 'initial' && r.plan === couple.plan
    );
    if (alreadyRequested) return;
    setBusy(true);
    setError(null);
    try {
      await getRepo().createPaymentRequest({
        coupleId: couple.id,
        plan: couple.plan,
        kind: 'initial',
        amountKz: PLAN_PRICE_KZ[couple.plan]
      });
      refresh();
    } catch {
      setError('Não foi possível gerar o pedido de pagamento. Verifique a sua ligação e tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  const suspended =
    couple?.status === 'suspended' || event?.status === 'suspended';

  const publish = async () => {
    if (!event) return;
    if (couple?.status === 'suspended') {
      alert('A sua conta está suspensa pela equipa Aura Nupcial. Contacte-nos para a reactivar.');
      return;
    }
    if (event.status === 'suspended') {
      alert('Este convite foi suspenso pela equipa Aura Nupcial. Contacte-nos para o reactivar.');
      return;
    }
    if (couple?.paymentStatus !== 'paid') return;
    setBusy(true);
    setError(null);
    try {
      if (event.status === 'active') {
        if (!confirm('Retirar o convite do ar? Os convidados deixam de conseguir abri-lo.')) return;
        await getRepo().setEventStatus(event.id, 'draft');
      } else {
        if (!confirm('Publicar o convite? O link fica activo para os convidados.')) return;
        await getRepo().setEventStatus(event.id, 'active');
      }
      refresh();
    } catch {
      setError('Não foi possível alterar o estado do convite. Verifique a sua ligação e tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !event || !couple) {
    return (
      <div className="bg-white border border-stone-200 rounded-xs p-8 text-center">
        <p className="text-sm text-stone-500 font-sans">
          A preparar a sua área... Se o problema persistir, contacte a equipa Aura Nupcial.
        </p>
      </div>
    );
  }

  const occasion = getOccasion(event.occasion);
  const names = eventNames(event);
  const paid = couple.paymentStatus === 'paid';
  const published = event.status === 'active';

  const steps = [
    {
      done: Boolean(names && event.dateIso),
      title: 'Preencher nomes e data',
      hint: 'Os dados básicos do convite.',
      to: '/cliente/dados',
      icon: PenLine
    },
    {
      done: guests.length > 0,
      title: 'Adicionar convidados',
      hint: 'Cada convidado recebe um link só dele.',
      to: '/cliente/convidados',
      icon: UserPlus
    },
    {
      done: paid,
      title: 'Confirmar o pagamento',
      hint: paid
        ? 'Pagamento confirmado — pode publicar.'
        : 'Gere o pedido de pagamento abaixo e envie o comprovativo por WhatsApp.',
      to: null,
      icon: CreditCard
    },
    {
      done: published,
      title: 'Publicar o convite',
      hint: published ? 'O convite está no ar!' : 'Disponível depois do pagamento confirmado.',
      to: null,
      icon: Rocket
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-stone-400">Visão geral</p>
        <h1 className="font-serif text-3xl text-stone-900 mt-1">
          {names || occasion.label}
        </h1>
        <p className="text-sm text-stone-600 font-sans mt-1">
          {[event.dateDisplay, event.locationDisplay].filter(Boolean).join(' · ') ||
            'Data e local por definir'}
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-700 font-sans">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-sm border ${
            published
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          {published ? 'Convite publicado' : 'Convite em preparação'}
        </span>
        <Link
          to="/cliente/convite"
          className="inline-flex items-center gap-1.5 text-xs text-[#5E6B56] hover:underline font-sans"
        >
          Ver o meu convite
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Primeiros passos */}
      <div className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6">
        <h2 className="font-serif text-xl text-stone-900">Primeiros passos</h2>
        <p className="text-xs text-stone-500 font-sans mt-1 mb-4">
          Siga a lista — quando todos estiverem marcados, o convite está pronto.
        </p>
        <ul className="space-y-3">
          {steps.map((s) => {
            const Icon = s.icon;
            const body = (
              <div className="flex items-start gap-3 w-full">
                {s.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-300 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-sans font-medium ${
                      s.done ? 'text-stone-400 line-through' : 'text-stone-800'
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-xs text-stone-500 font-sans mt-0.5">{s.hint}</p>
                </div>
                <Icon className="w-4 h-4 text-stone-300 shrink-0" />
              </div>
            );
            return (
              <li key={s.title}>
                {s.to ? (
                  <Link
                    to={s.to}
                    className="flex items-center bg-[#FAF7F2] border border-stone-200 rounded-xs p-3.5 hover:border-[#5E6B56] transition-colors"
                  >
                    {body}
                  </Link>
                ) : s.title === 'Publicar o convite' ? (
                  <button
                    onClick={publish}
                    disabled={busy || suspended || (!paid && !published)}
                    className={`flex items-center w-full text-left rounded-xs p-3.5 border transition-colors ${
                      paid && !suspended
                        ? 'bg-[#5E6B56] border-[#5E6B56] hover:bg-[#4E5B46] cursor-pointer'
                        : 'bg-stone-50 border-stone-200 cursor-not-allowed'
                    } ${busy ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className={`flex items-start gap-3 w-full ${paid && !suspended ? 'text-white' : ''}`}>
                      {s.done ? (
                        <CheckCircle2
                          className={`w-5 h-5 shrink-0 mt-0.5 ${paid && !suspended ? 'text-white' : 'text-emerald-600'}`}
                        />
                      ) : (
                        <Circle
                          className={`w-5 h-5 shrink-0 mt-0.5 ${paid && !suspended ? 'text-white/70' : 'text-stone-300'}`}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-sans font-medium ${
                            paid && !suspended ? 'text-white' : 'text-stone-500'
                          }`}
                        >
                          {s.done && published ? 'Convite publicado' : 'Publicar o convite'}
                        </p>
                        <p
                          className={`text-xs font-sans mt-0.5 ${
                            paid && !suspended ? 'text-white/80' : 'text-stone-400'
                          }`}
                        >
                          {s.done && published
                            ? 'Pode retirar do ar ou re-publicar quando quiser.'
                            : suspended
                              ? 'Contacte a equipa Aura Nupcial para reactivar.'
                              : paid
                                ? 'Clique para pôr o convite no ar.'
                                : 'Desbloqueado após confirmação do pagamento.'}
                        </p>
                      </div>
                      <Rocket className="w-4 h-4 shrink-0 opacity-70" />
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center bg-[#FAF7F2] border border-stone-200 rounded-xs p-3.5">
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Plano */}
      <div className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif text-xl text-stone-900">O seu plano</h2>
            <p className="text-xs text-stone-500 font-sans mt-1">
              {planGuestLimitLabel(couple.plan)} · pagamento único
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-sm border ${
              paid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            {paid ? 'Pagamento confirmado' : 'Pagamento pendente'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(['starter', 'pro', 'premium'] as PlanId[]).map((p) => {
            const active = couple.plan === p;
            const requested = couple.pendingPlan === p && !active;
            return (
              <button
                key={p}
                type="button"
                onClick={() => switchPlan(p)}
                disabled={busy}
                className={`text-left p-4 rounded-xs border transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${active ? 'border-[#5E6B56] bg-white shadow-md' : 'border-stone-200 bg-[#FAF7F2] hover:border-stone-300'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-serif text-lg text-stone-900">{PLAN_LABEL[p]}</p>
                  {active && (
                    <span className="text-[10px] uppercase tracking-widest text-[#5E6B56] font-semibold">
                      Actual
                    </span>
                  )}
                  {requested && (
                    <span className="text-[10px] uppercase tracking-widest text-amber-600 font-semibold">
                      Pedido
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 font-sans mt-1">
                  {planGuestLimitLabel(p)}
                </p>
                <p className="text-[11px] text-stone-400 font-sans mt-1">
                  {formatKz(PLAN_PRICE_KZ[p])} Kz ·{' '}
                  {p === 'starter'
                    ? 'RSVP e envio por WhatsApp'
                    : p === 'pro'
                      ? 'QR Code, música e relatórios'
                      : 'tudo desbloqueado'}
                </p>
              </button>
            );
          })}
        </div>
        {couple.pendingPlan && couple.pendingPlan !== couple.plan && (
          <p className="text-[11px] text-amber-700 font-sans mt-3 leading-relaxed">
            Upgrade para o plano {PLAN_LABEL[couple.pendingPlan]} pedido — assim que a equipa
            confirmar o pagamento, o plano é actualizado e os benefícios são desbloqueados.
          </p>
        )}

        {/* Painel de pagamento — visível enquanto houver pedido pendente
            (inclui upgrades de casais já pagos, que precisam da referência
            da diferença) */}
        {!paid || couple.pendingPlan ? (
          <div className="mt-4 border-t border-stone-200 pt-4">
            {(() => {
              const pendingRequest = requests.find(
                (r) => r.status === 'pending' && r.plan === (couple.pendingPlan ?? couple.plan)
              );
              if (!pendingRequest) {
                if (paid) return null;
                return (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-stone-500 font-sans">
                      Gere um pedido de pagamento com referência única — pague por IBAN ou
                      Multicaixa Express e envie o comprovativo por WhatsApp.
                    </p>
                    <button
                      type="button"
                      onClick={createInitialRequest}
                      disabled={busy}
                      className="inline-flex items-center gap-2 text-xs font-sans font-medium text-white bg-[#5E6B56] border border-[#5E6B56] rounded-sm px-4 py-2 hover:bg-[#4E5B46] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Gerar pedido de pagamento
                    </button>
                  </div>
                );
              }
              const message =
                `Olá! Acabei de gerar o pedido de pagamento na Aura Nupcial.\n` +
                `Referência: ${pendingRequest.reference}\n` +
                `Plano: ${PLAN_LABEL[pendingRequest.plan]}${pendingRequest.kind === 'upgrade' ? ' (upgrade)' : ''}\n` +
                `Valor: ${formatKz(pendingRequest.amountKz)} Kz\n` +
                `Cliente: ${names || '—'}\n` +
                `Vou enviar o comprovativo por aqui. Obrigado(a)!`;
              const copyReference = async () => {
                try {
                  await navigator.clipboard.writeText(pendingRequest.reference);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  /* clipboard indisponível */
                }
              };
              return (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-stone-200 rounded-sm px-3 py-2">
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-sans">
                        Referência
                      </span>
                      <span className="text-sm font-mono font-semibold text-stone-900">
                        {pendingRequest.reference}
                      </span>
                      <button
                        type="button"
                        onClick={copyReference}
                        className="text-[11px] font-sans text-[#5E6B56] hover:underline cursor-pointer"
                      >
                        {copied ? 'Copiada!' : 'Copiar'}
                      </button>
                    </span>
                    <span className="text-sm font-serif text-stone-900">
                      {formatKz(pendingRequest.amountKz)} Kz
                    </span>
                    <span className="text-[11px] text-stone-400 font-sans">
                      {pendingRequest.kind === 'upgrade' ? 'Upgrade' : 'Plano inicial'}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 font-sans space-y-1">
                    {settings?.paymentIban ? (
                      <p>
                        <span className="text-stone-400">IBAN:</span>{' '}
                        <span className="font-mono">{settings.paymentIban}</span>
                      </p>
                    ) : null}
                    {settings?.paymentMcxPhone ? (
                      <p>
                        <span className="text-stone-400">Multicaixa Express:</span>{' '}
                        <span className="font-mono">{settings.paymentMcxPhone}</span>
                      </p>
                    ) : null}
                    {settings?.paymentHolderName ? (
                      <p>
                        <span className="text-stone-400">Titular:</span>{' '}
                        {settings.paymentHolderName}
                      </p>
                    ) : null}
                    {!settings?.paymentIban && !settings?.paymentMcxPhone ? (
                      <p>
                        Os dados de pagamento serão mostrados aqui assim que forem
                        configurados — contacte-nos por WhatsApp para os receber.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={whatsappLink(message)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-sans font-medium text-white bg-[#5E6B56] border border-[#5E6B56] rounded-sm px-4 py-2 hover:bg-[#4E5B46] transition-colors"
                    >
                      Enviar comprovativo por WhatsApp
                    </a>
                    <span className="text-[11px] text-stone-400 font-sans">
                      Assim que a equipa confirmar, o plano é activado.
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="text-[11px] text-emerald-700 font-sans mt-4 leading-relaxed">
            Pagamento confirmado — o convite pode ser publicado quando quiser.
          </p>
        )}
      </div>

      <Reveal className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xs p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-sans">
              Convidados
            </span>
            <Users className="w-4 h-4 text-stone-300" />
          </div>
          <p className="text-3xl font-serif text-stone-900 mt-2">{guests.length}</p>
          <p className="text-[11px] text-stone-400 font-sans mt-1">
            {PLAN_GUEST_LIMIT[couple.plan] === null
              ? 'ilimitados'
              : `limite ${PLAN_GUEST_LIMIT[couple.plan]}`}{' '}
            · plano {PLAN_LABEL[couple.plan]}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xs p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-sans">
              Confirmados
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-serif text-emerald-800 mt-2">{confirmed.length}</p>
          <p className="text-[11px] text-stone-400 font-sans mt-1">{people} pessoas esperadas</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xs p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-sans">
              Recusas
            </span>
            <XCircle className="w-4 h-4 text-stone-600" />
          </div>
          <p className="text-3xl font-serif text-stone-700 mt-2">{declined.length}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xs p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-sans">
              Sem resposta
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-serif text-amber-700 mt-2">{pending.length}</p>
        </div>
      </Reveal>

      <Reveal className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/cliente/convidados"
          className="bg-white border border-stone-200 rounded-xs p-5 hover:border-[#5E6B56] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-stone-900">Gerir convidados</p>
              <p className="text-xs text-stone-500 font-sans mt-1">
                Adicionar, remover e enviar convites.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#5E6B56]" />
          </div>
        </Link>
        <Link
          to="/cliente/rsvp"
          className="bg-white border border-stone-200 rounded-xs p-5 hover:border-[#5E6B56] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-stone-900">Ver confirmações</p>
              <p className="text-xs text-stone-500 font-sans mt-1">
                Quem já respondeu ao convite ({opened} aberturas).
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#5E6B56]" />
          </div>
        </Link>
      </Reveal>
    </div>
  );
};
