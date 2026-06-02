import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getUserSubscription } from '@/lib/subscription'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '未ログイン' }, { status: 401 })
  }

  const sub = await getUserSubscription(user.id)
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'サブスクリプションなし' }, { status: 404 })
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
