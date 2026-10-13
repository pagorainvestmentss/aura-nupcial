import { describe, it, expect } from 'vitest';
import { generatePaymentReference } from './reference';

describe('generatePaymentReference', () => {
  it('tem o formato AURA-XXXX', () => {
    expect(generatePaymentReference()).toMatch(/^AURA-[A-Z2-9]{4}$/);
  });

  it('não usa caracteres ambíguos (0, O, 1, I, L)', () => {
    for (let i = 0; i < 50; i++) {
      const ref = generatePaymentReference();
      expect(ref).not.toMatch(/[0O1IL]/);
    }
  });

  it('gera referências distintas', () => {
    const refs = new Set(Array.from({ length: 200 }, () => generatePaymentReference()));
    // Com 32^4 = ~1M combinações, 200 amostras têm colisão praticamente nula.
    expect(refs.size).toBeGreaterThan(190);
  });
});
