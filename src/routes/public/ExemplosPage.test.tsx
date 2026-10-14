import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ExemplosPage } from './ExemplosPage';

/** Os links de exemplo: slug + token do convidado demo (seed local e produção). */
const CONVITES_DEMO = [
  'Mariana & Pedro',
  'Sofia & André',
  'Joana & Miguel'
];

describe('ExemplosPage — cartões clicáveis', () => {
  const renderPagina = () =>
    render(
      <MemoryRouter>
        <ExemplosPage />
      </MemoryRouter>
    );

  it('cada cartão abre o convite real do convidado de demonstração', () => {
    renderPagina();

    const hrefs = CONVITES_DEMO.map(
      (names) =>
        screen.getByRole('link', { name: new RegExp(names) }).getAttribute('href')
    );

    expect(hrefs).toEqual([
      '/convite/mariana-pedro/8Fk92KsP',
      '/convite/sofia-andre/marta-4Rc8Bn',
      '/convite/joana-miguel/domingos-3Vn9Pa'
    ]);
  });

  it('há exactamente 3 exemplos ligados a convites', () => {
    renderPagina();

    const convites = screen
      .getAllByRole('link')
      .filter((a) => (a.getAttribute('href') || '').startsWith('/convite/'));

    expect(convites).toHaveLength(3);
  });

  it('o CTA continua a apontar para a criação de convite', () => {
    renderPagina();

    expect(screen.getByRole('link', { name: /Criar o meu convite/ })).toHaveAttribute(
      'href',
      '/criar'
    );
  });
});
