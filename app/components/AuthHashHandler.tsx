'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// 別ドメインアプリから #access_token=...&refresh_token=... で渡されたセッションを復元する
export default function AuthHashHandler() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.includes('access_token=')) return

    const params = new URLSearchParams(hash.slice(1))
    const access_token  = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    if (!access_token || !refresh_token) return

    supabase.auth.setSession({ access_token, refresh_token }).then(() => {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    })
  }, [])

  return null
}
