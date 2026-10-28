import { NextRequest, NextResponse } from 'next/server'
import { medyaOku } from '@/lib/medya-depo'

const MIME_TIPLERI: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

// Public — kimlik doğrulama yok. Meta Graph API video_url/image_url'i buradan okuyabilsin diye.
export async function GET(req: NextRequest, { params }: { params: { dosya: string } }) {
  try {
    const buffer = await medyaOku(params.dosya)
    const uzanti = params.dosya.slice(params.dosya.lastIndexOf('.'))
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': MIME_TIPLERI[uzanti] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
  }
}
