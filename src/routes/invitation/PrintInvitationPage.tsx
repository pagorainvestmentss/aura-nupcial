import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { PrintCard } from '../../components/invitation/PrintCard';
import { InvalidInvitation } from '../../components/invitation/InvalidInvitation';
import { useInviteByToken } from '../../hooks/useInviteByToken';

/**
 * CARTÃO DE IMPRESSÃO — /convite/:eventSlug/:guestToken/imprimir
 *
 * Carrega o mesmo convite do convidado (via `useInviteByToken`) e mostra o
 * cartão A5 pronto a imprimir. A toolbar ("Imprimir / Guardar PDF" + "Voltar")
 * tem a classe `no-print` e some no papel; o cartão usa o CSS `@media print`
 * de `index.css` (tamanho A5, cores de fundo preservadas).
 */
export const PrintInvitationPage: React.FC = () => {
  const { eventSlug = '', guestToken = '' } = useParams();
  const navigate = useNavigate();
  const state = useInviteByToken(eventSlug, guestToken);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F1EA]">
        <p className="text-sm text-stone-500 font-sans">A preparar o cartão…</p>
      </div>
    );
  }

  if (state.reason === 'revoked') {
    return <InvalidInvitation reason="revoked" onGoHome={() => navigate('/')} />;
  }

  const { event, guest } = state;
  if (state.reason === 'not_found' || !event || !guest) {
    return <InvalidInvitation reason="not_found" onGoHome={() => navigate('/')} />;
  }

  return (
    <div className="print-page min-h-screen bg-[#EFE9DF] py-6 px-3 print:bg-white print:py-0 print:px-0">
      {/* Toolbar — some no papel */}
      <div className="no-print max-w-[148mm] mx-auto mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-widest font-semibold text-stone-600 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-widest font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Cartão A5 */}
      <div className="mx-auto shadow-xl print:shadow-none">
        <PrintCard event={event} guest={guest} />
      </div>

      <p className="no-print max-w-[148mm] mx-auto mt-3 text-center text-[11px] font-sans text-stone-500">
        Na janela de impressão escolha A5 retrato e active “Gráficos de fundo” para
        preservar as cores do cartão.
      </p>
    </div>
  );
};
