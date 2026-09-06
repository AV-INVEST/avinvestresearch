import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeInstance) return stripeInstance;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || typeof secretKey !== 'string' || secretKey.length === 0) {
    throw new Error(
      'STRIPE_SECRET_KEY non configurata. Impostala nelle variabili ambiente prima di avviare il checkout.',
    );
  }
  if (secretKey.includes('replace-with') || secretKey.includes('REPLACE')) {
    throw new Error('STRIPE_SECRET_KEY contiene un valore placeholder.');
  }
  stripeInstance = new Stripe(secretKey, {
    typescript: true,
    appInfo: {
      name: 'AV-INVEST Research',
      version: '1.0.0',
    },
  });
  return stripeInstance;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || typeof secret !== 'string' || secret.length === 0) {
    throw new Error('STRIPE_WEBHOOK_SECRET non configurata.');
  }
  return secret;
}

export function isStripeConfigured(): boolean {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    return Boolean(key && !key.includes('replace-with') && !key.includes('REPLACE') && key.startsWith('sk_'));
  } catch {
    return false;
  }
}
