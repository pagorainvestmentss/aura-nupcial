import React from 'react';
import { Mail, MapPin, Check, MessageCircle } from 'lucide-react';
import { WHATSAPP_DISPLAY, whatsappLink } from '../../data/site';

export const ContactoPage: React.FC = () => {
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">Contacto</p>
          <h1 className="font-serif text-4xl text-stone-900">Vamos falar do seu convite</h1>
          <p className="mt-4 text-sm text-stone-600 font-sans leading-relaxed">
            Dúvidas sobre pacotes, ocasiões ou pagamentos? Fale connosco pelo
            WhatsApp — respondemos em horas úteis, normalmente em menos de 24 horas.
          </p>

          <a
            href={whatsappLink('Olá! Gostaria de saber mais sobre os convites Aura Nupcial.')}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Falar por WhatsApp
          </a>

          <div className="mt-8 space-y-4 text-sm font-sans text-stone-700">
            <p className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-[#5E6B56]" />
              {WHATSAPP_DISPLAY}
            </p>
            <p className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#5E6B56]" />
              ola@auranupcial.com
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#5E6B56]" />
              Luanda (AO) · Lisboa (PT)
            </p>
          </div>

          <div className="mt-8 bg-[#F4EFE6] border border-stone-200 p-5 rounded-xs">
            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              <strong className="text-stone-800">Horário:</strong> Segunda a sexta, 9h às 18h.
              Aos sábados, apenas por marcação.
            </p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-xs shadow-xs">
          {sent ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#EAE3D5] flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-[#5E6B56]" />
              </div>
              <h2 className="font-serif text-2xl text-stone-900">Mensagem enviada</h2>
              <p className="text-sm text-stone-600 font-sans mt-2">
                Obrigado! Entraremos em contacto nas próximas 24 horas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-serif text-2xl text-stone-900">Pedir orçamento</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                  Data da celebração
                </label>
                  <input
                    type="date"
                    className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                    Pacote de interesse
                  </label>
                  <select className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs focus:outline-none focus:border-[#5E6B56]">
                    <option>Starter</option>
                    <option>Pro</option>
                    <option>Premium</option>
                    <option>À medida</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-sans font-medium text-stone-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  className="w-full py-2.5 px-3 text-sm font-sans bg-[#FAF7F2] border border-stone-300 rounded-xs resize-none focus:outline-none focus:border-[#5E6B56]"
                  placeholder="Conte-nos sobre o vosso dia..."
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors cursor-pointer"
              >
                Enviar mensagem
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
