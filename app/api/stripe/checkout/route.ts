import { NextRequest, NextResponse } from 'next/server'
import { stripe, PREMIUM_PRICE_ID } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '未ログイン' }, { status: 401 })
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
    metadata: { user_id: user.id },
    customer_email: user.email,
    success_url: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard`,
    locale: 'ja',
  })

  return NextResponse.json({ url: session.url })
}
