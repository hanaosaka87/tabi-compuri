// 旅コンプリのiOSアプリ（Capacitor, server.url方式）からのアクセスかどうかを判定するヘルパー。
//
// Apple App Store審査ガイドライン3.1.1（アプリ内で使えるデジタル機能・サブスクリプションは
// Apple公式のIn-App Purchase経由でなければならず、Stripe等の外部決済をアプリ内に表示するのは禁止）
// に対応するため、NEXT_PUBLIC_PREMIUM_ENABLEDが将来trueになってもiOSアプリ内ではStripeの
// 購入導線を表示しない（クレゲーで確立したパターンをそのまま流用）。
// capacitor.config.tsのios.appendUserAgentでUser-Agentにマーカーを付与し、これを検出する。
export const IOS_APP_UA_MARKER = 'TabiCompuriIOSApp';

export function isIOSAppRequest(userAgent: string | null | undefined): boolean {
  return !!userAgent && userAgent.includes(IOS_APP_UA_MARKER);
}

export function isNativeIOSApp(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } };
  if (w.Capacitor?.isNativePlatform?.() && w.Capacitor?.getPlatform?.() === 'ios') return true;
  return isIOSAppRequest(window.navigator?.userAgent);
}
