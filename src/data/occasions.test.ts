import { describe, it, expect } from 'vitest';
import { displayMonogram, eventNames } from './occasions';

const base = { monogram: '', brideName: '', groomName: '' };

describe('displayMonogram — monograma pronto a mostrar no convite', () => {
  it('usa o valor guardado quando existe', () => {
    expect(displayMonogram({ ...base, monogram: 'M & P', brideName: 'Maria', groomName: 'Pedro' })).toBe('M + P');
    expect(displayMonogram({ ...base, monogram: 'Ana', brideName: 'x', groomName: 'y' })).toBe('Ana');
  });

  it('monograma vazio deriva as iniciais dos nomes', () => {
    expect(displayMonogram({ ...base, monogram: '', brideName: 'Maria', groomName: 'Gabriel' })).toBe('M + G');
    expect(displayMonogram({ ...base, monogram: '   ', brideName: 'mariana', groomName: 'pedro' })).toBe('M + P');
  });

  it('só um nome devolve a inicial desse nome', () => {
    expect(displayMonogram({ ...base, monogram: '', brideName: 'Joana', groomName: '' })).toBe('J');
    expect(displayMonogram({ ...base, monogram: '', brideName: '', groomName: 'miguel' })).toBe('M');
  });

  it('sem nomes nem monograma devolve vazio (pré-visualização)', () => {
    expect(displayMonogram(base)).toBe('');
    expect(displayMonogram({ ...base, monogram: '  ', brideName: ' ', groomName: '' })).toBe('');
  });

  it('monograma guardado com espaços é limpo antes de mostrar', () => {
    expect(displayMonogram({ ...base, monogram: '  S & A  ', brideName: 'Sofia', groomName: 'André' })).toBe('S + A');
  });
});

describe('eventNames — nome completo do evento', () => {
  it('junta os nomes com a junção personalizada ou "&"', () => {
    expect(eventNames({ brideName: 'Maria', conjunction: '', groomName: 'Gabriel' })).toBe('Maria & Gabriel');
    expect(eventNames({ brideName: 'Maria', conjunction: 'e', groomName: 'Gabriel' })).toBe('Maria e Gabriel');
  });
});
