import { ImageResponse } from 'next/og'

export const alt = '旅コンプリ | 日本全国制覇アプリ'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* 背景装飾 */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        }} />

        {/* メインコンテンツ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 96 }}>🗾</div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 72, fontWeight: 800, color: '#ffffff', letterSpacing: '-2px' }}>
              旅コンプリ
            </div>
            <div style={{
              fontSize: 28, color: '#34d399', fontWeight: 600, letterSpacing: '1px',
            }}>
              日本全国制覇の旅へ
            </div>
          </div>

          {/* スポット数バッジ */}
          <div style={{
            display: 'flex', gap: 16, marginTop: 8,
          }}>
            {[
              { num: '47', label: '都道府県' },
              { num: '1,741', label: '市区町村' },
              { num: '1,782', label: 'お城' },
              { num: '1,774', label: '温泉' },
              { num: '1,238', label: '道の駅' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 16, padding: '10px 18px',
              }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#34d399' }}>{item.num}</span>
                <span style={{ fontSize: 14, color: '#94a3b8', marginTop: 2 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div style={{
          position: 'absolute', bottom: 32,
          fontSize: 18, color: '#475569',
        }}>
          tabi-compuri.hana.trickster.biz
        </div>
      </div>
    ),
    { ...size },
  )
}
