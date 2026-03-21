"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface Character {
  color: string
  eyeColor: string
  x: number
  y: number
  emoji?: string
}

const CHARACTERS: Character[] = [
  { color: '#7c3aed', eyeColor: '#fff', x: 0, y: 0 },
  { color: '#1a1a1a', eyeColor: '#fff', x: 0, y: 0 },
  { color: '#f97316', eyeColor: '#fff', x: 0, y: 0 },
  { color: '#fbbf24', eyeColor: '#1a1a1a', x: 0, y: 0 },
]

interface EyePos { x: number; y: number }

export function AnimatedCharactersLogin({ onLogin, type = 'musteri' }: { onLogin: (data: any) => Promise<boolean | void>; type?: 'musteri' | 'admin' }) {
  const [kasaNo, setKasaNo] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isTypingPass, setIsTypingPass] = useState(false)
  const [blinkState, setBlinkState] = useState([false, false, false, false])
  const formRef = useRef<HTMLDivElement>(null)

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Random blinking
  useEffect(() => {
    const intervals = CHARACTERS.map((_, i) =>
      setInterval(() => {
        setBlinkState(prev => {
          const next = [...prev]
          next[i] = true
          setTimeout(() => setBlinkState(p => { const n = [...p]; n[i] = false; return n }), 150)
          return next
        })
      }, 2000 + i * 800 + Math.random() * 1000)
    )
    return () => intervals.forEach(clearInterval)
  }, [])

  const getEyeOffset = (charIndex: number, rect: DOMRect | null) => {
    if (!rect) return { ox: 0, oy: 0 }
    const charPositions = [
      { x: rect.left + rect.width * 0.1, y: rect.top - 60 },
      { x: rect.left + rect.width * 0.35, y: rect.top - 60 },
      { x: rect.left + rect.width * 0.65, y: rect.top - 60 },
      { x: rect.left + rect.width * 0.9, y: rect.top - 60 },
    ]
    const charPos = charPositions[charIndex]
    const dx = mousePos.x - charPos.x
    const dy = mousePos.y - charPos.y
    const angle = Math.atan2(dy, dx)
    const dist = Math.min(4, Math.sqrt(dx * dx + dy * dy) / 20)
    return { ox: Math.cos(angle) * dist, oy: Math.sin(angle) * dist }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await onLogin({ kasaNo, password, type })
      if (result === false) {
        setError('Kasa no veya şifre hatalı. Lütfen tekrar deneyin.')
      }
    } catch {
      setError('Kasa no veya şifre hatalı. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const rect = formRef.current?.getBoundingClientRect() || null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="w-full max-w-md">
        {/* Characters */}
        <div className="flex justify-center gap-4 mb-8" ref={formRef}>
          {CHARACTERS.map((char, i) => {
            const { ox, oy } = getEyeOffset(i, rect)
            const isPeeking = showPass && i === 0
            const isLooking = isTypingPass && i !== 3

            return (
              <div key={i} className="relative" style={{ width: 64, height: 80 }}>
                {/* Body */}
                <div
                  className="rounded-2xl w-16 h-16 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300"
                  style={{
                    background: char.color,
                    transform: isLooking ? 'rotate(-10deg)' : 'rotate(0deg)',
                  }}
                >
                  {/* Eyes */}
                  {!blinkState[i] ? (
                    <div className="flex gap-2 mt-1">
                      {[0, 1].map(eye => (
                        <div key={eye} className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <div
                            className="w-2.5 h-2.5 rounded-full transition-transform duration-100"
                            style={{
                              background: isPeeking && eye === 1 ? char.eyeColor : '#333',
                              transform: `translate(${ox}px, ${oy}px)`,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-1">
                      {[0, 1].map(eye => (
                        <div key={eye} className="w-5 h-1 bg-white/80 rounded-full" />
                      ))}
                    </div>
                  )}

                  {/* Mouth */}
                  <div
                    className="mt-2 rounded-full transition-all duration-300"
                    style={{
                      width: isLooking ? 8 : 14,
                      height: isLooking ? 8 : 6,
                      background: 'rgba(255,255,255,0.6)',
                      borderRadius: isLooking ? '50%' : '0 0 8px 8px',
                    }}
                  />

                  {/* Peek cover for char 0 when showing pass */}
                  {isPeeking && (
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-black/30 rounded-b-2xl" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#eaeaea] p-8">
          <div className="text-center mb-6">
            <h1 className="font-bebas text-3xl tracking-[3px] text-[#1a1a1a]">
              {type === 'admin' ? 'ADMİN GİRİŞİ' : 'TEKLİF KASASI'}
            </h1>
            <p className="text-[#555] text-sm mt-1 font-montserrat">
              {type === 'admin' ? 'Yönetici hesabınızla giriş yapın' : 'Kasa numaranız ve şifrenizle giriş yapın'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#333] mb-1 font-montserrat">
                {type === 'admin' ? 'E-Posta' : 'Kasa No veya E-Posta'}
              </label>
              <input
                type="text"
                value={kasaNo}
                onChange={e => setKasaNo(e.target.value)}
                placeholder={type === 'admin' ? 'admin@404dijital.com' : '404-001'}
                className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#333] mb-1 font-montserrat">Şifre</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setIsTypingPass(e.target.value.length > 0) }}
                  onFocus={() => setIsTypingPass(true)}
                  onBlur={() => setIsTypingPass(false)}
                  placeholder="••••••••"
                  className="w-full border border-[#eaeaea] rounded-xl px-4 py-3 text-sm font-montserrat focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#333]"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-montserrat bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm disabled:opacity-60"
            >
              {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#999] mt-4 font-montserrat">
          🔐 ENCRYPTED CONNECTION ESTABLISHED
        </p>
      </div>
    </div>
  )
}
