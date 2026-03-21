"use client"
import { useState } from 'react'
import { Check } from 'lucide-react'
import { Badge } from './badge'

interface PricingCardProps {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  isPopular?: boolean
  isYearly: boolean
  badge?: string
}

export function PricingCard({ name, monthlyPrice, yearlyPrice, features, isPopular, isYearly, badge }: PricingCardProps) {
  const price = isYearly ? yearlyPrice : monthlyPrice
  const savings = monthlyPrice - yearlyPrice

  const scrollToContact = () => {
    const el = document.getElementById('contact')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className={`pricing-card relative bg-white rounded-2xl border-2 p-8 flex flex-col ${isPopular ? 'border-[#1a1a1a] shadow-2xl scale-105' : 'border-[#eaeaea]'}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#1a1a1a] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
            EN ÇOK TERCİH
          </span>
        </div>
      )}
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#ffc107] text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase">
            {badge}
          </span>
        </div>
      )}

      <h3 className="font-bebas text-2xl tracking-wider text-[#1a1a1a] mb-4">{name}</h3>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span
            className="font-bebas text-4xl text-[#1a1a1a] transition-all duration-300"
            key={price}
          >
            {price.toLocaleString('tr-TR')}
          </span>
          <span className="text-[#555] font-montserrat text-sm">₺/ay</span>
        </div>
        {isYearly && savings > 0 && (
          <div className="mt-1">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              {savings.toLocaleString('tr-TR')}₺ tasarruf
            </span>
          </div>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#555] font-montserrat">
            <Check className="w-4 h-4 text-[#1a1a1a] flex-shrink-0 mt-0.5" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={scrollToContact}
        className={`btn-primary w-full text-sm ${isPopular ? 'bg-[#ffc107] text-black' : ''}`}
        style={isPopular ? { background: '#ffc107', color: '#1a1a1a' } : {}}
      >
        HEMEN BAŞLA
      </button>
    </div>
  )
}
