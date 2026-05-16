import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
        }}
      >
        <div style={{ fontSize: 300, lineHeight: 1 }}>🗾</div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: '#34d399',
            marginTop: 8,
            letterSpacing: '-2px',
          }}
        >
          旅コンプリ
        </div>
      </div>
    ),
    { ...size }
  )
}
