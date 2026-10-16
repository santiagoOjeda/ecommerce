import { initMercadoPago } from '@mercadopago/sdk-react';

let isInitialized = false;

export function initializeMercadoPagoClient() {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '';

  if (publicKey && publicKey !== 'TEST-mock-public-key') {
    try {
      initMercadoPago(publicKey, { locale: 'es-AR' });
      isInitialized = true;
    } catch (err) {
      console.warn('Failed initializing Mercado Pago SDK client:', err);
    }
  }
}
