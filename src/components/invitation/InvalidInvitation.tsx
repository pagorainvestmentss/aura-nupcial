import React from 'react';
import { BotanicalCorner, BotanicalDivider, BotanicalWreath } from '../common/BotanicalFlourish';

interface InvalidInvitationProps {
  onGoHome?: () => void;
  reason?: 'not_found' | 'expired' | 'revoked';
}

export const InvalidInvitation: React.FC<InvalidInvitationProps> = ({
  onGoHome,
  reason = 'not_found'
}) => {
  const getMessage = () => {
    switch (reason) {
      case 'expired':
        return {
          title: 'Este Convite Expirou',
          description: 'O período de confirmação e acesso para esta celebração foi encerrado pelos anfitriões.'
        };
      case 'revoked':
        return {
          title: 'Convite Indisponível',
          description: 'Este enlace ou convite individual já não se encontra ativo no sistema.'
        };
      case 'not_found':
      default:
        return {
          title: 'Convite Não Encontrado',
          description: 'O link acessado é inválido ou foi digitado incorretamente. Por favor, verifique a mensagem enviada pelos anfitriões.'
        };
    }
  };

  const info = getMessage();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#FAF7F2] text-[#2C302E]">
      <div className="relative w-full max-w-md p-10 text-center bg-[#F4EFE6] border border-stone-300 rounded-xs shadow-lg">
        <div className="absolute top-3 left-3">
          <BotanicalCorner position="top-left" color="#5E6B56" />
        </div>
        <div className="absolute bottom-3 right-3">
          <BotanicalCorner position="bottom-right" color="#5E6B56" />
        </div>

        <BotanicalWreath color="#5E6B56" size={110} className="mx-auto mb-6">
          <span className="font-serif text-lg tracking-widest text-stone-700">AURA</span>
        </BotanicalWreath>

        <h2 className="font-serif text-2xl sm:text-3xl font-light text-stone-900 mb-3">
          {info.title}
        </h2>

        <BotanicalDivider color="#5E6B56" className="my-4" />

        <p className="font-serif italic text-sm text-stone-600 leading-relaxed mb-8">
          {info.description}
        </p>

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-sans font-medium text-white bg-[#5E6B56] hover:bg-[#4E5B46] transition-colors rounded-xs shadow-xs cursor-pointer"
          >
            Retornar à Página Principal
          </button>
        )}
      </div>
    </div>
  );
};
