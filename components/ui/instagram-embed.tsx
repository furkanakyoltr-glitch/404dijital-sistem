"use client"
import { useEffect } from 'react'

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } }
  }
}

export function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    const scriptId = 'instagram-embed-script'
    function process() {
      window.instgrm?.Embeds.process()
    }
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.onload = process
      document.body.appendChild(script)
    } else {
      process()
    }
  }, [url])

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ background: '#FFF', border: 0, borderRadius: 12, margin: 0, maxWidth: '100%', minWidth: 272, width: '100%' }}
    />
  )
}
