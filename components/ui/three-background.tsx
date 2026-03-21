"use client"
import { useEffect, useRef } from 'react'

export function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    const DOTS = 120
    const dots: { x: number; y: number; vx: number; vy: number; size: number; phase: number }[] = []

    for (let i = 0; i < DOTS; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 1,
        phase: Math.random() * Math.PI * 2,
      })
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      t += 0.01

      dots.forEach((dot, i) => {
        // Wave motion
        dot.x += dot.vx + Math.sin(t + dot.phase) * 0.3
        dot.y += dot.vy + Math.cos(t + dot.phase * 0.7) * 0.3

        // Wrap around
        if (dot.x < 0) dot.x = width
        if (dot.x > width) dot.x = 0
        if (dot.y < 0) dot.y = height
        if (dot.y > height) dot.y = 0

        // Draw dot
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(26, 26, 26, 0.6)'
        ctx.fill()

        // Connect nearby dots
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[j].x - dot.x
          const dy = dots[j].y - dot.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(dots[j].x, dots[j].y)
            ctx.strokeStyle = `rgba(26, 26, 26, ${0.15 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.4 }}
    />
  )
}
