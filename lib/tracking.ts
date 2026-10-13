export const LEAD_CONVERSION_LABEL = 'AW-17698873591/yAnSCKjX2bgbEPfBvfdB'

export function trackLeadConversion() {
  if (typeof window === 'undefined' || !(window as any).gtag) return
  ;(window as any).gtag('event', 'conversion', {
    send_to: LEAD_CONVERSION_LABEL,
    value: 1.0,
    currency: 'TRY',
  })
  ;(window as any).gtag('event', 'generate_lead', {
    currency: 'TRY',
    value: 1.0,
  })
}

export function trackContactClick(channel: 'whatsapp' | 'phone') {
  if (typeof window === 'undefined' || !(window as any).gtag) return
  ;(window as any).gtag('event', 'conversion', {
    send_to: LEAD_CONVERSION_LABEL,
    value: 1.0,
    currency: 'TRY',
  })
  ;(window as any).gtag('event', channel === 'whatsapp' ? 'contact_whatsapp' : 'contact_phone')
}
