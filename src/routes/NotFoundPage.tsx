import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

/**
 * Página 404 do site público.
 */
export const NotFoundPage: React.FC = () => (
  <div className="max-w-xl mx-auto px-5 py-24 text-center">
    <Compass className="w-8 h-8 text-stone-300 mx-auto mb-5" />
    <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">Erro 404</p>
    <h1 className="font-serif text-4xl text-stone-900">Página não encontrada</h1>
    <p className="text-sm text-stone-600 font-sans mt-3">
      O endereço que procurou não existe ou foi movido.
    </p>
    <Link
      to="/"
      className="inline-block mt-8 px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold text-white bg-[#5E6B56] hover:bg-[#4E5B46] rounded-xs transition-colors"
    >
      Voltar ao início
    </Link>
  </div>
);
