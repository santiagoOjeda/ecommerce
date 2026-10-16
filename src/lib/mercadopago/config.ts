import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const accessToken = process.env.MP_ACCESS_TOKEN || '';

export const isMercadoPagoConfigured = Boolean(
  accessToken &&
  accessToken !== 'TEST-mock-token-for-dev' &&
  !accessToken.startsWith('TEST-00000000')
);

export const mpClient = new MercadoPagoConfig({
  accessToken: accessToken || 'TEST-mock-access-token-placeholder',
  options: { timeout: 5000 },
});

export const preferenceClient = new Preference(mpClient);
export const paymentClient = new Payment(mpClient);
