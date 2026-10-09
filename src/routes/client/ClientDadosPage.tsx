import React from 'react';
import { Save, Heart, Info, Image as ImageIcon, Plus, X, Loader2 } from 'lucide-react';
import { WeddingStorageService } from '../../services/weddingStorage';
import { WeddingEvent } from '../../types/wedding';
import { useClientEvent } from './useClientEvent';
import { getOccasion } from '../../data/occasions';
import { PLAN_GALLERY_LIMIT } from '../../data/site';
import { ACCEPTED_IMAGE_ATTR, processImage } from '../../utils/imageUpload';
import { SmartImage } from '../../components/motion/SmartImage';

const MONTHS_PT = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

/** '2027-01-15' -> '15 JANEIRO 2027' (formato usado em todo o convite). */
function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  const month = MONTHS_PT[Number(m) - 1];
  if (!month) return '';
  return `${Number(d)} ${month} ${y}`;
}

/** Iniciais sugeridas para o monograma: 'M & P'. */
function suggestMonogram(bride: string, groom: string): string {
  const i1 = bride.trim().charAt(0).toUpperCase();
  const i2 = groom.trim().charAt(0).toUpperCase();
  if (i1 && i2) return `${i1} & ${i2}`;
  return i1 || i2 || '';
}

/**
 * DADOS DO EVENTO (cliente) — editar informações do convite em linguagem simples.
 * Rótulos por ocasião, exemplos em cada campo, data automática a partir do calendário
 * e monograma sugerido a partir dos nomes.
 */
export const ClientDadosPage: React.FC = () => {
  const [version, setVersion] = React.useState(0);
  const { event, couple } = useClientEvent(version);
  const [form, setForm] = React.useState<WeddingEvent | null>(event);
  const [saved, setSaved] = React.useState(false);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
const [isProcessing, setIsProcessing] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const monoTouched = React.useRef(false);

  React.useEffect(() => {
    if (event && !form) setForm(event);
  }, [event, form]);

  if (!event || !form) {
    return (
      <div className="bg-white border border-stone-200 rounded-xs p-8 text-center">
        <p className="text-sm text-stone-500 font-sans">A carregar os seus dados...</p>
      </div>
    );
  }

  const def = getOccasion(form.occasion);
  const L = def.labels;
  const isPro = couple?.plan === 'pro';

  const patch = (partial: Partial<WeddingEvent>) => setForm({ ...form, ...partial });

  /** Alterar nomes: mantém o monograma automático enquanto o cliente não o escrever. */
  const patchNames = (partial: Partial<WeddingEvent>) => {
    const next = { ...form, ...partial };
    if (!monoTouched.current) {
      next.monogram = suggestMonogram(next.brideName, next.groomName);
    }
    setForm(next);
  };

  /** Escolher data no calendário: gera o texto do convite automaticamente. */
  const handleDateIso = (iso: string) => {
    const display = isoToDisplay(iso);
    setForm({ ...form, dateIso: iso, dateDisplay: display || form.dateDisplay });
  };

  const galleryLimit = isPro
    ? PLAN_GALLERY_LIMIT.pro
    : PLAN_GALLERY_LIMIT.essential;

  /** Foto escolhida: redimensiona/comprime no navegador e coloca no formulário. */
  const readFileAsPhoto = async (file: File): Promise<string | null> => {
    try {
      return await processImage(file);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Não foi possível carregar a foto.');
      return null;
    }
  };

  const handleHeroFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite escolher o mesmo ficheiro outra vez
    if (!file) return;
    setPhotoError(null);
    setIsProcessing(true);
    try {
      const url = await readFileAsPhoto(file);
      if (url) patch({ heroPhoto: url });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setPhotoError(null);
    setIsProcessing(true);

    try {
      const room = galleryLimit - form.gallery.length;
      const next = [...form.gallery];
      for (const file of files.slice(0, room)) {
        const url = await readFileAsPhoto(file);
        if (url) {
          next.push({
            id: `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            url
          });
        }
      }
      if (files.length > room) {
        setPhotoError(
          `O seu plano permite até ${galleryLimit} fotos de galeria — remova algumas para acrescentar outras.`
        );
      }
      patch({ gallery: next });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeGalleryPhoto = (id: string) =>
    patch({ gallery: form.gallery.filter((p) => p.id !== id) });

  const setGalleryCaption = (id: string, caption: string) =>
    patch({
      gallery: form.gallery.map((p) => (p.id === id ? { ...p, caption } : p))
    });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const guardado = WeddingStorageService.saveEvent(form);
    if (!guardado) {
      setSaved(false);
      setSaveError(
        'Não foi possível guardar — o armazenamento do navegador está cheio. Remova algumas fotos e tente de novo.'
      );
      return;
    }
    setPhotoError(null);
    setSaveError(null);
    setSaved(true);
    setVersion((v) => v + 1);
    setTimeout(() => setSaved(false), 3000);
  };

  const field =
    'w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]';
  const labelCls = 'block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1';
  const hintCls = 'text-[11px] text-stone-400 font-sans mt-1';

  const optionalHint = 'Deixe vazio para não mostrar no convite.';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-stone-400">{L.pageTitle}</p>
        <h1 className="font-serif text-3xl text-stone-900 mt-1">Informações do convite</h1>
        <p className="text-sm text-stone-600 font-sans mt-1">
          Estas informações aparecem no convite dos seus convidados.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-800 font-sans flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#5E6B56]" />
            {L.peopleSection}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>{L.person1}</label>
              <input
                value={form.brideName}
                onChange={(e) => patchNames({ brideName: e.target.value })}
                placeholder="Ex.: Mariana"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>{L.conjunction}</label>
              <input
                value={form.conjunction}
                onChange={(e) => patch({ conjunction: e.target.value })}
                placeholder="Ex.: & ou e"
                className={`${field} text-center`}
              />
            </div>
            <div>
              <label className={labelCls}>{L.person2}</label>
              <input
                value={form.groomName}
                onChange={(e) => patchNames({ groomName: e.target.value })}
                placeholder="Ex.: Pedro"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>Data (calendário)</label>
              <input
                type="date"
                value={form.dateIso}
                onChange={(e) => handleDateIso(e.target.value)}
                className={field}
              />
              <p className={hintCls}>Escolha a data — o texto do convite é gerado sozinho.</p>
            </div>
            <div>
              <label className={labelCls}>Data (texto no convite)</label>
              <input
                value={form.dateDisplay}
                onChange={(e) => patch({ dateDisplay: e.target.value })}
                placeholder="Ex.: 15 JANEIRO 2027"
                className={field}
              />
              <p className={hintCls}>Pode ajustar as palavras manualmente.</p>
            </div>
            <div>
              <label className={labelCls}>{L.location}</label>
              <input
                value={form.locationDisplay}
                onChange={(e) => patch({ locationDisplay: e.target.value })}
                placeholder="Ex.: LUANDA — ANGOLA"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>{L.monogram}</label>
              <input
                value={form.monogram}
                onChange={(e) => {
                  monoTouched.current = true;
                  patch({ monogram: e.target.value });
                }}
                placeholder={
                  suggestMonogram(form.brideName, form.groomName)
                    ? `Sugestão: ${suggestMonogram(form.brideName, form.groomName)}`
                    : 'Ex.: M & P'
                }
                className={field}
              />
              <p className={hintCls}>Preenchido a partir dos nomes — pode mudar.</p>
            </div>
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-800 font-sans">{L.verseSection}</h2>
          <div>
            <label className={labelCls}>{L.verse}</label>
            <textarea
              value={form.verse.text}
              onChange={(e) => patch({ verse: { ...form.verse, text: e.target.value } })}
              rows={3}
              placeholder="Ex.: Tudo quanto fizerem, façam-no de todo o coração."
              className={field}
            />
            <p className={hintCls}>{optionalHint}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{L.verseCitation}</label>
              <input
                value={form.verse.citation}
                onChange={(e) => patch({ verse: { ...form.verse, citation: e.target.value } })}
                placeholder="Ex.: Colossenses 3:16"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>Prazo para confirmar</label>
              <input
                type="date"
                value={form.rsvpDeadline}
                onChange={(e) => patch({ rsvpDeadline: e.target.value })}
                className={field}
              />
              <p className={hintCls}>Data limite para os convidados responderem.</p>
            </div>
          </div>
          <div>
            <label className={labelCls}>{L.intro}</label>
            <textarea
              value={form.invitationIntro}
              onChange={(e) => patch({ invitationIntro: e.target.value })}
              rows={3}
              placeholder={`Ex.: ${def.defaults.invitationIntro}`}
              className={field}
            />
          </div>
          <div>
            <label className={labelCls}>{L.messageFinal}</label>
            <textarea
              value={form.coupleMessage.body}
              onChange={(e) =>
                patch({ coupleMessage: { ...form.coupleMessage, body: e.target.value } })
              }
              rows={3}
              placeholder="Ex.: Com todo o nosso carinho, contamos consigo."
              className={field}
            />
            <p className={hintCls}>{optionalHint}</p>
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-800 font-sans">{L.ceremonySection}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{L.ceremonyVenue}</label>
              <input
                value={form.ceremony.venue}
                onChange={(e) => patch({ ceremony: { ...form.ceremony, venue: e.target.value } })}
                placeholder="Ex.: Igreja da Sé"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>{L.ceremonyTime}</label>
              <input
                value={form.ceremony.time}
                onChange={(e) => patch({ ceremony: { ...form.ceremony, time: e.target.value } })}
                placeholder="Ex.: 16h00"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>{L.ceremonyAddress}</label>
              <input
                value={form.ceremony.address}
                onChange={(e) =>
                  patch({ ceremony: { ...form.ceremony, address: e.target.value } })
                }
                placeholder="Ex.: Rua 1 de Maio, Luanda"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>{L.ceremonyMaps}</label>
              <input
                value={form.ceremony.mapsUrl}
                onChange={(e) =>
                  patch({ ceremony: { ...form.ceremony, mapsUrl: e.target.value } })
                }
                placeholder="Ex.: https://maps.app.goo.gl/..."
                className={field}
              />
              <p className={hintCls}>Os convidados tocam para abrir a rota.</p>
            </div>
            <div>
              <label className={labelCls}>{L.receptionVenue}</label>
              <input
                value={form.reception.venue}
                onChange={(e) => patch({ reception: { ...form.reception, venue: e.target.value } })}
                placeholder="Ex.: Restaurante Ilha"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>{L.receptionTime}</label>
              <input
                value={form.reception.time}
                onChange={(e) => patch({ reception: { ...form.reception, time: e.target.value } })}
                placeholder="Ex.: 18h30"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>{L.receptionAddress}</label>
              <input
                value={form.reception.address}
                onChange={(e) =>
                  patch({ reception: { ...form.reception, address: e.target.value } })
                }
                placeholder="Ex.: Av. 4 de Fevereiro, Luanda"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls}>{L.receptionMaps}</label>
              <input
                value={form.reception.mapsUrl}
                onChange={(e) =>
                  patch({ reception: { ...form.reception, mapsUrl: e.target.value } })
                }
                placeholder="Ex.: https://maps.app.goo.gl/..."
                className={field}
              />
            </div>
          </div>
        </section>

        <section className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-800 font-sans flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#5E6B56]" />
            As nossas fotos
          </h2>

          <div>
            <label className={labelCls}>Foto principal (capa do convite)</label>
            <div className="flex items-start gap-4">
              {form.heroPhoto ? (
                <SmartImage
                  src={form.heroPhoto}
                  alt="Foto principal"
                  className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded-xs border border-stone-200"
                />
              ) : (
                <div className="w-24 h-32 sm:w-28 sm:h-36 border border-dashed border-stone-300 rounded-xs flex items-center justify-center text-[10px] uppercase tracking-wider text-stone-400 font-sans text-center px-2">
                  Sem foto
                </div>
              )}
              <div className="space-y-2">
                <label
                  className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 border border-stone-300 hover:border-[#5E6B56] rounded-xs cursor-pointer transition-colors ${
                    isProcessing ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {form.heroPhoto ? 'Trocar foto' : 'Escolher foto'}
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_ATTR}
                    className="hidden"
                    onChange={handleHeroFile}
                    disabled={isProcessing}
                  />
                </label>
                {form.heroPhoto && (
                  <button
                    type="button"
                    onClick={() => patch({ heroPhoto: '' })}
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stone-500 hover:text-stone-800 font-sans cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remover foto
                  </button>
                )}
                <p className={hintCls}>JPG, PNG ou WEBP até 10 MB — reduzimos por si.</p>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Galeria de fotos ({form.gallery.length}/{galleryLimit})
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {form.gallery.map((photo) => (
                <div key={photo.id} className="space-y-1.5">
                  <div className="relative aspect-square border border-stone-200 rounded-xs overflow-hidden">
                    <SmartImage
                      src={photo.url}
                      alt={photo.caption || 'Foto da galeria'}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryPhoto(photo.id)}
                      aria-label="Remover foto"
                      className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-white/90 border border-stone-200 rounded-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    value={photo.caption}
                    onChange={(e) => setGalleryCaption(photo.id, e.target.value)}
                    placeholder="Legenda (opcional)"
                    className={`${field} text-xs py-1.5`}
                  />
                </div>
              ))}
              {form.gallery.length < galleryLimit && (
                <label
                  className={`aspect-square border border-dashed border-stone-300 rounded-xs flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-[#5E6B56] hover:text-[#5E6B56] cursor-pointer transition-colors ${
                    isProcessing ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] uppercase tracking-wider font-sans">Adicionar</span>
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_ATTR}
                    multiple
                    className="hidden"
                    onChange={handleGalleryFiles}
                    disabled={isProcessing}
                  />
                </label>
              )}
            </div>
            {form.gallery.length >= galleryLimit && (
              <p className={hintCls}>
                {isPro
                  ? `Limite de ${galleryLimit} fotos do plano Pro atingido.`
                  : `O plano Essencial inclui ${galleryLimit} fotos — faça upgrade para acrescentar mais.`}
              </p>
            )}
          </div>

          {isProcessing && (
            <p className="flex items-center gap-2 text-xs text-[#5E6B56] font-sans" aria-live="polite">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              A optimizar a foto, um instante…
            </p>
          )}

          {photoError && (
            <p className="text-xs text-red-700 font-sans">{photoError}</p>
          )}
        </section>

        <section className="bg-white border border-stone-200 rounded-xs p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-stone-800 font-sans">Preferências do convite</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowPlusOnes}
                onChange={(e) => patch({ allowPlusOnes: e.target.checked })}
                className="w-4 h-4 accent-[#5E6B56]"
              />
              <span className="text-sm text-stone-700 font-sans">Permitir acompanhantes</span>
            </label>
            {(
              [
                ['enableMusic', 'Música de fundo no convite'],
                ['enableQrValidation', 'QR Code de check-in no dia']
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className={`flex items-center gap-3 ${isPro ? 'cursor-pointer' : 'opacity-60'}`}
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  disabled={!isPro}
                  onChange={(e) => patch({ [key]: e.target.checked } as Partial<WeddingEvent>)}
                  className="w-4 h-4 accent-[#5E6B56]"
                />
                <span className="text-sm text-stone-700 font-sans">{label}</span>
                {!isPro && (
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-sans">
                    Plano Pro
                  </span>
                )}
              </label>
            ))}
          </div>
          {!isPro && (
            <p className="flex items-start gap-2 text-[11px] text-stone-500 font-sans">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Música e check-in por QR incluem-se no plano Pro — pode activá-los no seu
              dashboard depois de fazer upgrade.
            </p>
          )}
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar alterações
          </button>
          {saved && (
            <span className="text-xs text-emerald-700 font-sans">
              Guardado! O seu convite já foi actualizado.
            </span>
          )}
          {saveError && (
            <span className="text-xs text-red-700 font-sans">{saveError}</span>
          )}
        </div>
      </form>
    </div>
  );
};
