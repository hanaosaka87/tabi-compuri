import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getUserSubscription(userId: string) {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId)
  if (!sub) return false
  if (sub.status !== 'active') return false
  if (!sub.current_period_end) return false
  return new Date(sub.current_period_end) > new Date()
}

export async function upsertSubscription(params: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  status: string
  currentPeriodEnd: Date
}) {
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: params.userId,
    stripe_customer_id: params.stripeCustomerId,
    stripe_subscription_id: params.stripeSubscriptionId,
    status: params.status,
    current_period_end: params.currentPeriodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
}
