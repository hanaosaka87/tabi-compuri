import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return _stripe
}

// 後方互換のための名前付きエクスポート
export const stripe = {
  checkout: { sessions: { create: (...args: Parameters<Stripe['checkout']['sessions']['create']>) => getStripe().checkout.sessions.create(...args) } },
  subscriptions: { retrieve: (...args: Parameters<Stripe['subscriptions']['retrieve']>) => getStripe().subscriptions.retrieve(...args) },
  webhooks: { constructEvent: (...args: Parameters<Stripe['webhooks']['constructEvent']>) => getStripe().webhooks.constructEvent(...args) },
  billingPortal: { sessions: { create: (...args: Parameters<Stripe['billingPortal']['sessions']['create']>) => getStripe().billingPortal.sessions.create(...args) } },
}

export const PREMIUM_PRICE_ID = process.env.STRIPE_PRICE_ID ?? ''
