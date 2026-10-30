export const storeConfig = {
  name: 'Sahle Cosmetics',
  wordmark: 'sahle',
  currency: { code: 'ETB', locale: 'en-ET' },
  contact: {
    email: 'hello@glowcosmetics.example',
    city: 'Addis Ababa, Ethiopia',
  },
} as const;

export function formatPrice(price: string | number) {
  const [wholePart = '0', fractionalPart = ''] = String(price).split('.');
  const whole = BigInt(wholePart).toLocaleString(storeConfig.currency.locale);
  const fraction = fractionalPart.slice(0, 2).replace(/0+$/, '');
  const amount = fraction ? `${whole}.${fraction}` : whole;
  return `${amount} ${storeConfig.currency.code}`;
}
