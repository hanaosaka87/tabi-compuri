import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { upsertSubscription } from '@/lib/subscription'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook署名エラー' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    if (!userId || !session.subscription) return NextResponse.json({ ok: true })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub: any = await stripe.subscriptions.retrieve(session.subscription as string)
    await upsertSubscription({
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: sub.id,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    })
  }

  if (event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = event.data.object as any
    const userId = sub.metadata?.user_id
    if (!userId) return NextResponse.json({ ok: true })

    await upsertSubscription({
      userId,
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      status: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    })
  }

  return NextResponse.json({ ok: true })
}
