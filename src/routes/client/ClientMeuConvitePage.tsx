import React from 'react';
import { ExternalLink, Copy, Check, QrCode, Eye, UserPlus, AlertTriangle, MessageCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { Link, useNavigate } from 'react-router-dom';
import { COLOR_PALETTES } from '../../data/palettes';
import { useClientEvent } from './useClientEvent';
import { getOccasion, eventNames } from '../../data/occasions';
import { SmartImage } from '../../components/motion/SmartImage';
import { guestInviteMessage, whatsappShareLink } from '../../utils/whatsapp';

/**
 * MEU CONVITE (cliente) — pré-visualização, link partilhável e QR.
 */
export const ClientMeuConvitePage: React.FC = () => {
  const { event, guests } = useClientEvent();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const firstGuest = guests[0];
  const inviteUrl =
    event && firstGuest
      ? `${window.location.origin}${import.meta.env.BASE_URL}convite/${event.slug}/${firstGuest.token}`
      : '';

  const copyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsapp = () => {
    if (!inviteUrl || !firstGuest) return;
    const url = whatsappShareLink(
      firstGuest.phone,
      guestInviteMessage(event!, firstGuest, inviteUrl),
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!event) {
    return (
      <div className="bg-white border border-stone-200 rounded-xs p-8 text-center">
        <p className="text-sm text-stone-500 font-sans">
          A preparar a sua área... Se o problema persistir, contacte a equipa Aura Nupcial.
        </p>
      </div>
    );
  }

  const occasion = getOccasion(event.occasion);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-stone-400">Meu convite</p>
        <h1 className="font-serif text-3xl text-stone-900 mt-1">O seu convite digital</h1>
        <p className="text-sm text-stone-600 font-sans mt-1">
          Cada convidado recebe um convite com o nome dele. Aqui está uma pré-visualização.
        </p>
      </div>

      {!firstGuest && (
        <div className="bg-amber-50 border border-amber-200 rounded-xs px-4 py-3 flex flex-wrap items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs font-sans text-amber-800 flex-1 min-w-52">
            Ainda não tem convidados — assim que adicionar o primeiro, o link e o QR ficam
            prontos aqui.
          </p>
          <Link
            to="/cliente/convidados"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] px-3 py-2 rounded-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Adicionar convidado
          </Link>
        </div>
      )}

      <div className="bg-[#F4EFE6] border border-stone-300 rounded-xs p-6 sm:p-8 text-center relative overflow-hidden">
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-sans">
          {[event.locationDisplay, event.dateDisplay].filter(Boolean).join(' · ') ||
            occasion.label}
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl font-light text-stone-900 mt-4">
          {event.brideName && event.groomName ? (
            <>
              {event.brideName}
              <span className="block font-serif italic text-2xl text-[#5E6B56] my-1">
                {event.conjunction}
              </span>
              {event.groomName}
            </>
          ) : (
            eventNames(event) || occasion.hero.title
          )}
        </h2>
        {event.verse.text && (
          <p className="font-serif italic text-sm text-stone-600 mt-4 leading-relaxed max-w-md mx-auto">
            {event.verse.text}
          </p>
        )}
        {event.verse.citation && (
          <p className="text-[11px] tracking-widest text-stone-500 font-sans mt-2">
            {event.verse.citation}
          </p>
        )}

        {firstGuest && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(`/convite/${event.slug}/${firstGuest.token}`)}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Abrir convite
            </button>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Nova janela
            </a>
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xs p-5">
        <h3 className="font-serif text-lg text-stone-900 mb-3">Identidade visual</h3>
        <div className="grid grid-cols-3 gap-3 text-xs font-sans">
          <div className="p-3 bg-[#FAF7F2] border border-stone-200 rounded-xs">
            <span className="text-stone-400 block text-[10px] uppercase">Paleta</span>
            <strong className="text-stone-900 font-medium">
              {COLOR_PALETTES[event.paletteId]?.name || 'Botânico Sálvia'}
            </strong>
          </div>
          <div className="p-3 bg-[#FAF7F2] border border-stone-200 rounded-xs">
            <span className="text-stone-400 block text-[10px] uppercase">Monograma</span>
            <strong className="text-stone-900 font-medium">{event.monogram}</strong>
          </div>
          <div className="p-3 bg-[#FAF7F2] border border-stone-200 rounded-xs">
            <span className="text-stone-400 block text-[10px] uppercase">Prazo RSVP</span>
            <strong className="text-stone-900 font-medium">
              {new Date(event.rsvpDeadline).toLocaleDateString('pt-PT')}
            </strong>
          </div>
        </div>
      </div>

      {firstGuest && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-stone-200 rounded-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-semibold text-stone-800 font-sans">Link de exemplo</h3>
            </div>
            <p className="text-[11px] text-stone-500 font-sans break-all bg-[#FAF7F2] border border-stone-200 rounded-xs p-3">
              {inviteUrl}
            </p>
            <button
              onClick={copyLink}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest font-semibold text-stone-700 bg-[#FAF7F2] border border-stone-300 hover:bg-stone-100 rounded-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <button
              onClick={shareWhatsapp}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest font-semibold text-[#5E6B56] border border-[#5E6B56]/40 hover:bg-[#5E6B56]/10 rounded-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Enviar por WhatsApp
            </button>
            <p className="text-[11px] text-stone-400 font-sans mt-2 leading-relaxed">
              É o link de um convidado de exemplo. Os convidados reais recebem cada um o seu.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xs p-5 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-3 self-start">
              <QrCode className="w-4 h-4 text-stone-400" />
              <h3 className="text-sm font-semibold text-stone-800 font-sans">QR do convite</h3>
            </div>
            <QrPreview url={inviteUrl} />
            <p className="text-[11px] text-stone-400 font-sans mt-3">
              Ideal para imprimir ou enviar aos convidados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const QrPreview: React.FC<{ url: string }> = ({ url }) => {
  const [dataUrl, setDataUrl] = React.useState('');

  React.useEffect(() => {
    QRCode.toDataURL(url, { width: 180, margin: 1, color: { dark: '#2C302E', light: '#FFFFFF' } })
      .then(setDataUrl)
      .catch((err) => console.error('Erro ao gerar QR:', err));
  }, [url]);

  if (!dataUrl) {
    return <div className="w-44 h-44 animate-pulse bg-stone-100 rounded-xs" />;
  }

  return <SmartImage src={dataUrl} alt="QR do convite" className="w-44 h-44 border border-stone-200 rounded-xs" />;
};
