import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('tr-TR').format(new Date(date))
}

export function generateKasaNo(): string {
  const num = Math.floor(Math.random() * 900) + 100
  return `404-${num.toString().padStart(3, '0')}`
}

export function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function calculateKDV(tutar: number, kdvOrani: number, kdvDahil: boolean) {
  if (kdvDahil) {
    const netTutar = tutar / (1 + kdvOrani / 100)
    return { netTutar, kdvTutar: tutar - netTutar, toplamTutar: tutar }
  } else {
    const kdvTutar = tutar * (kdvOrani / 100)
    return { netTutar: tutar, kdvTutar, toplamTutar: tutar + kdvTutar }
  }
}
