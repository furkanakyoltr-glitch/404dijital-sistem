import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Sosyal medya paylaşım medyası (Reels videoları, tasarım görselleri) burada tutulur.
// Graph API'nin video_url/image_url parametreleri herkese açık bir URL ister; bu yüzden
// dosyalar Railway volume'üne yazılıp /api/sosyal-medya/medya/[dosya] route'u ile public
// olarak servis edilir. MEDIA_DIR env var'ı Railway volume mount path'i ile eşleşmeli
// (volume yoksa deploy'lar arası kaybolur, ama tek seferlik yayın için çalışır).
const MEDIA_DIR = process.env.MEDIA_DIR || '/data/sosyal-medya'

function guvenliDosyaAdi(gonderiId: string, orijinalAd: string) {
  const uzanti = path.extname(orijinalAd) || ''
  return `${gonderiId}${uzanti}`
}

export async function medyaKaydet(file: File, gonderiId: string): Promise<string> {
  if (!existsSync(MEDIA_DIR)) await mkdir(MEDIA_DIR, { recursive: true })
  const dosyaAdi = guvenliDosyaAdi(gonderiId, file.name)
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(MEDIA_DIR, dosyaAdi), buffer)

  const taban = process.env.NEXTAUTH_URL || 'https://www.404dijital.com'
  return `${taban}/api/sosyal-medya/medya/${dosyaAdi}`
}

export async function medyaOku(dosyaAdi: string): Promise<Buffer> {
  const guvenliAd = path.basename(dosyaAdi)
  return readFile(path.join(MEDIA_DIR, guvenliAd))
}
