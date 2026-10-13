const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Referência única de pedido de pagamento (ex.: AURA-8F4K).
 * Alfabeto sem caracteres ambíguos (0/O, 1/I/L) para o cliente poder
 * ditá-la ou transcrevê-la pelo WhatsApp sem erros.
 */
export function generatePaymentReference(): string {
  let out = '';
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) {
    out += CHARS[bytes[i] % CHARS.length];
  }
  return `AURA-${out}`;
}
