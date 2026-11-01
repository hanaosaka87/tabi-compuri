// 旅コンプリ 新アイコン（Designerfab.png）からfavicon一式を生成
// 実行: node scripts/generate-icons.js
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SOURCE = 'c:/dev/sns-automation/characters/Designerfab.png'
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const APP_DIR = path.join(__dirname, '..', 'app')
const MASKABLE_BG = '#022F4F' // 原画の背景濃紺を実測してサンプリングした色

// 原画は四隅だけでなく外周にも薄い余白（実測：片側約53px/1254px）が残っているため、まず正方形に内側クロップする
const MARGIN = 53
const CROP_SIZE = 1254 - MARGIN * 2

// クロップ後の角丸半径比率（対角線ピクセルサンプリングで実測：約20.5%、ロゴが切れないよう少し広めの21%を採用）
const CORNER_RADIUS_RATIO = 0.21

async function clipRoundedCorners(buffer, size) {
  const r = Math.round(size * CORNER_RADIUS_RATIO)
  const maskSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  )
  return sharp(buffer)
    .resize(size, size)
    .ensureAlpha()
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

// maskableアイコン用：OSが丸形等でマスクしても切れないよう、セーフゾーン内に収まる縮小率でブランドカラー背景の上に配置する
// 角丸21%の形状の角先端は中心から約0.59×innerScaleの位置（r*(1-cos45)=0.2929r、arc中心距離+r）に来るため、
// innerScale ≤ 0.4/0.59 ≈ 0.678 が理論上の上限。安全マージンを残し0.65を採用
async function buildMaskable(clipped, size) {
  const inner = Math.round(size * 0.65)
  const art = await sharp(clipped).resize(inner, inner).png().toBuffer()
  return sharp({
    create: { width: size, height: size, channels: 4, background: MASKABLE_BG },
  })
    .composite([{ input: art, gravity: 'center' }])
    .png()
    .toBuffer()
}

// 32x32 PNGを1枚だけ内包する最小構成のICOファイルを作る
function buildIco(pngBuffers) {
  const count = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)

  let offset = 6 + count * 16
  const dirEntries = []
  const dataChunks = []
  for (const { size, buf } of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(buf.length, 8)
    entry.writeUInt32LE(offset, 12)
    dirEntries.push(entry)
    dataChunks.push(buf)
    offset += buf.length
  }
  return Buffer.concat([header, ...dirEntries, ...dataChunks])
}

async function main() {
  const cropped = await sharp(SOURCE)
    .extract({ left: MARGIN, top: MARGIN, width: CROP_SIZE, height: CROP_SIZE })
    .toBuffer()
  // 四隅の白い余白（角丸の外側）を透明化した「白縁なし」マスター画像
  const clipped = await clipRoundedCorners(cropped, 1024)

  const icon512 = await sharp(clipped).resize(512, 512).png().toBuffer()
  const icon192 = await sharp(clipped).resize(192, 192).png().toBuffer()
  const appleTouch = await sharp(clipped).resize(180, 180).png().toBuffer()
  const favicon32 = await sharp(clipped).resize(32, 32).png().toBuffer()
  const favicon16 = await sharp(clipped).resize(16, 16).png().toBuffer()
  const favicon32Rgba = await sharp(clipped).resize(32, 32).ensureAlpha().png().toBuffer()
  const favicon16Rgba = await sharp(clipped).resize(16, 16).ensureAlpha().png().toBuffer()

  const maskable512 = await buildMaskable(clipped, 512)
  const maskable192 = await buildMaskable(clipped, 192)

  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512.png'), icon512)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-192.png'), icon192)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-maskable-512.png'), maskable512)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-maskable-192.png'), maskable192)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), appleTouch)
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon-32.png'), favicon32)

  const ico = buildIco([
    { size: 16, buf: favicon16Rgba },
    { size: 32, buf: favicon32Rgba },
  ])
  fs.writeFileSync(path.join(APP_DIR, 'favicon.ico'), ico)

  console.log('✅ icon-512.png / icon-192.png / icon-maskable-512.png / icon-maskable-192.png / apple-touch-icon.png / favicon-32.png / app/favicon.ico を更新しました')
}

main().catch(err => { console.error(err); process.exit(1) })
