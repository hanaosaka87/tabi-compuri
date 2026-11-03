import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'biz.trickster.hana.tabicompuri.app',
  appName: '旅コンプリ',
  webDir: 'public',
  // Next.jsのAPI Routes・Supabase認証をそのまま使うため、静的バンドルではなく
  // 本番URLをそのままネイティブWebViewで開くリモート方式を採用（Android TWA方式と同じ発想）
  server: {
    url: 'https://tabi-compuri.hana.trickster.biz',
    cleartext: false,
  },
  ios: {
    // コンテンツがステータスバー/ホームインジケーターに重なる問題の対策（クレゲーで確立済み）。
    // 常にセーフエリア分の余白を確保してWebViewを配置する
    contentInset: 'always',
    // サーバー側でiOSアプリからのリクエストを判別するためのUser-Agentマーカー
    // （将来NEXT_PUBLIC_PREMIUM_ENABLED=trueにした際、Apple審査ガイドライン3.1.1対応で
    // iOSアプリ内ではStripe購入導線を表示しないための備え。lib/iosApp.ts参照）
    appendUserAgent: 'TabiCompuriIOSApp',
  },
};

export default config;
