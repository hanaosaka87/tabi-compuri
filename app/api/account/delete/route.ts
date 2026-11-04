import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

function isReady() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const path = url.split('/photos/')[1]
  return path || null
}

// POST /api/account/delete  header: Authorization: Bearer <access_token>
// ユーザー本人がプロフィールページから起動するアカウント削除。Apple Guideline 5.1.1(v)対応。
// 注意：いいとこどり（iitokodori.hana.trickster.biz）は旅コンプリと同一Supabaseプロジェクト（同一auth.users）に
// 同居しているため、同じメールアドレスで両アプリを使っているユーザーは同一アカウント。
// このAPIはいいとこどり側のデータ（reviews等）もあわせて削除する。いいとこどり側のAPI
// （app/api/account/delete/route.ts）も同様に旅コンプリ側のデータを削除する。
export async function POST(req: NextRequest) {
  if (!isReady()) return NextResponse.json({ error: '設定エラー' }, { status: 500 })

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })

  const admin = getAdminClient()

  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 })
  }
  const userId = userData.user.id

  try {
    // 1. 有効なStripeサブスクリプションがあれば先に解約
    const { data: sub } = await admin.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()
    if (sub?.stripe_subscription_id && sub.status === 'active') {
      try {
        await getStripe().subscriptions.cancel(sub.stripe_subscription_id)
      } catch (e) {
        console.error('Stripe subscription cancel failed during account deletion', e)
      }
    }

    // 2. 旅日記・いいとこどりレビューの写真ストレージパスを先に集める（同じ'photos'バケットを共用）
    const { data: diaries } = await admin.from('diaries').select('photo_url').eq('user_id', userId)
    const { data: iitokoReviews } = await admin.from('reviews').select('id').eq('user_id', userId)
    const iitokoReviewIds = (iitokoReviews ?? []).map((r) => r.id)
    const { data: reviewPhotos } = iitokoReviewIds.length > 0
      ? await admin.from('review_photos').select('storage_url').in('review_id', iitokoReviewIds)
      : { data: [] as { storage_url: string | null }[] }
    const storagePaths = [
      ...(diaries ?? []).map((d) => storagePathFromUrl(d.photo_url)),
      ...(reviewPhotos ?? []).map((p) => storagePathFromUrl(p.storage_url)),
    ].filter((p): p is string => !!p)
    if (storagePaths.length > 0) {
      await admin.storage.from('photos').remove(storagePaths)
    }

    // 3. group_members（FK制約がありauth.users削除前に消す必要がある）
    await admin.from('group_members').delete().eq('user_id', userId)

    // 4. 本人が作成したグループを削除（group_membersはon delete cascadeで自動追従）
    await admin.from('groups').delete().eq('created_by', userId)

    // 5. 個人の記録データを削除
    await admin.from('diaries').delete().eq('user_id', userId)
    await admin.from('visits').delete().eq('user_id', userId)
    await admin.from('city_visits').delete().eq('user_id', userId)
    await admin.from('spot_visits').delete().eq('user_id', userId)

    // 5b. いいとこどり側のデータも削除（同一Supabaseプロジェクトのため。各テーブルはauth.usersへの
    //     on delete cascadeが設定済みだが、どちらのアプリ起点でも確実に消えるよう明示的に削除する）
    await admin.from('helpful_votes').delete().eq('user_id', userId)
    await admin.from('owner_replies').delete().eq('user_id', userId)
    await admin.from('facility_owners').delete().eq('user_id', userId)
    if (iitokoReviewIds.length > 0) {
      await admin.from('review_photos').delete().in('review_id', iitokoReviewIds)
    }
    await admin.from('reviews').delete().eq('user_id', userId)

    // 6. profilesを削除
    await admin.from('profiles').delete().eq('id', userId)

    // 7. auth.usersを削除。subscriptionsはon delete cascade、spot_updates/app_feedbacks/app_reviewsは
    //    on delete set nullで自動的に匿名化される（投稿自体はランキング等と同様に匿名集計データとして残る）
    const { error: delUserErr } = await admin.auth.admin.deleteUser(userId)
    if (delUserErr) throw delUserErr

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('account delete failed', e)
    return NextResponse.json({ error: '削除に失敗しました。時間をおいて再度お試しいただくか、お問い合わせください。' }, { status: 500 })
  }
}
