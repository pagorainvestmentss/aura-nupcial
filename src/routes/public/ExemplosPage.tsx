import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const EXAMPLES = [
  {
    names: 'Mariana & Pedro',
    date: '15 Janeiro 2027 · Luanda',
    palette: 'Botânico Sálvia',
    colors: ['#D8DFD5', '#5E6B56', '#FAF7F2'],
    slug: 'mariana-pedro',
    token: '8Fk92KsP',
    live: true
  },
  {
    names: 'Sofia & André',
    date: '22 Maio 2027 · Lisboa',
    palette: 'Elegância Terracota',
    colors: ['#E8D5C4', '#A9714B', '#FBF6F0'],
    slug: 'sofia-andre',
    token: 'marta-4Rc8Bn',
    live: true
  },
  {
    names: 'Joana & Miguel',
    date: '12 Dezembro 2026 · Benguela',
    palette: 'Clássico Dourado',
    colors: ['#EFE4CC', '#B8975A', '#FAF7F2'],
    slug: 'joana-miguel',
    token: 'domingos-3Vn9Pa',
    live: true
  }
];

export const ExemplosPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-3">Portefólio</p>
        <h1 className="font-serif text-4xl text-stone-900">Exemplos de convites</h1>
        <p className="mt-4 text-sm text-stone-600 font-sans leading-relaxed">
          Cada convite é uma peça única. Estes exemplos estão vivos — abra-os e navegue
          como um convidado real.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXAMPLES.map((ex) => (
          <div
            key={ex.slug}
            className="bg-white border border-stone-200 rounded-xs overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
          >
            <div
              className="h-40 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ex.colors[0]}, ${ex.colors[2]})` }}
            >
              <div className="text-center">
                <p className="font-serif text-2xl text-stone-800">{ex.names}</p>
                <div
                  className="mx-auto mt-2 h-px w-16"
                  style={{ background: ex.colors[1] }}
                />
                <p className="text-[10px] uppercase tracking-[0.25em] mt-2 text-stone-500">
                  {ex.palette}
                </p>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <p className="text-xs text-stone-500 font-sans">{ex.date}</p>
              <Link
                to={`/convite/${ex.slug}/${ex.token}`}
                className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-800 bg-[#FAF7F2] border border-stone-300 hover:bg-stone-50 rounded-xs transition-colors"
              >
                Abrir convite
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
