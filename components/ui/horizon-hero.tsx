'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

interface ThreeRefs {
  scene: THREE.Scene | null
  camera: THREE.PerspectiveCamera | null
  renderer: THREE.WebGLRenderer | null
  composer: EffectComposer | null
  stars: THREE.Points[]
  nebula: THREE.Mesh | null
  mountains: THREE.Mesh[]
  animationId: number | null
  targetCameraX?: number
  targetCameraY?: number
  targetCameraZ?: number
  locations?: number[]
}

const SECTION_CONTENT = [
  {
    title: '404 DİJİTAL',
    badge: '%850+ ORTALAMA ROI',
    subtitle: 'Sosyal Medya Değil, Reklam Ajansı!',
    desc: 'Türkiye\'nin en ölçülebilir performans reklam ajansı.',
    showForm: true,
  },
  {
    title: 'SATIŞLARINIZI ARTTIRIN',
    badge: '50+ AKTİF MÜŞTERİ',
    subtitle: '%850+ Ortalama ROI · ₺12M+ Yönetilen Bütçe',
    desc: '4+ yıldır işletmelerin satışlarını büyütüyoruz.',
    showForm: false,
  },
  {
    title: 'HAREKETE GEÇİN',
    badge: '24 SAAT GARANTİ',
    subtitle: 'Ücretsiz analiz ile büyüme potansiyelinizi keşfedin.',
    desc: '24 saat içinde geri dönüş garantisi.',
    showForm: false,
  },
]

interface HorizonHeroProps {
  onFormSubmit?: (data: { isletmeAdi: string; telefon: string }) => void
}

export function HorizonHero({ onFormSubmit }: HorizonHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [formData, setFormData] = useState({ isletmeAdi: '', telefon: '' })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const totalSections = 2

  const threeRefs = useRef<ThreeRefs>({
    scene: null, camera: null, renderer: null, composer: null,
    stars: [], nebula: null, mountains: [], animationId: null,
  })

  useEffect(() => {
    if (!canvasRef.current) return
    const refs = threeRefs.current

    refs.scene = new THREE.Scene()
    refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025)

    refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    refs.camera.position.z = 100
    refs.camera.position.y = 20

    refs.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true })
    refs.renderer.setSize(window.innerWidth, window.innerHeight)
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping
    refs.renderer.toneMappingExposure = 0.5

    refs.composer = new EffectComposer(refs.renderer)
    refs.composer.addPass(new RenderPass(refs.scene, refs.camera))
    refs.composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.4, 0.85))

    // Stars
    for (let layer = 0; layer < 3; layer++) {
      const count = 5000
      const geo = new THREE.BufferGeometry()
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const sizes = new Float32Array(count)

      for (let j = 0; j < count; j++) {
        const r = 200 + Math.random() * 800
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        positions[j * 3] = r * Math.sin(phi) * Math.cos(theta)
        positions[j * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        positions[j * 3 + 2] = r * Math.cos(phi)

        const color = new THREE.Color()
        const c = Math.random()
        if (c < 0.7) color.setHSL(0, 0, 0.8 + Math.random() * 0.2)
        else if (c < 0.9) color.setHSL(0.08, 0.5, 0.8)
        else color.setHSL(0.6, 0.5, 0.8)
        colors[j * 3] = color.r; colors[j * 3 + 1] = color.g; colors[j * 3 + 2] = color.b
        sizes[j] = Math.random() * 2 + 0.5
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, depth: { value: layer } },
        vertexShader: `
          attribute float size; attribute vec3 color; varying vec3 vColor;
          uniform float time; uniform float depth;
          void main() {
            vColor = color; vec3 pos = position;
            float angle = time * 0.05 * (1.0 - depth * 0.3);
            mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            pos.xy = rot * pos.xy;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0 - smoothstep(0.0, 0.5, dist));
          }
        `,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const stars = new THREE.Points(geo, mat)
      refs.scene!.add(stars)
      refs.stars.push(stars)
    }

    // Nebula
    const nebGeo = new THREE.PlaneGeometry(8000, 4000, 100, 100)
    const nebMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x0033ff) },
        color2: { value: new THREE.Color(0xff6600) },
        opacity: { value: 0.25 },
      },
      vertexShader: `
        varying vec2 vUv; varying float vElevation; uniform float time;
        void main() {
          vUv = uv; vec3 pos = position;
          float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
          pos.z += elevation; vElevation = elevation;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1; uniform vec3 color2; uniform float opacity; uniform float time;
        varying vec2 vUv; varying float vElevation;
        void main() {
          float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
          vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
          float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
    })
    refs.nebula = new THREE.Mesh(nebGeo, nebMat)
    refs.nebula.position.z = -1050
    refs.scene!.add(refs.nebula)

    // Mountains
    const layers = [
      { distance: -50, height: 60, color: 0x1a1a2e, opacity: 1 },
      { distance: -100, height: 80, color: 0x16213e, opacity: 0.8 },
      { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6 },
      { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4 },
    ]
    layers.forEach((layer, index) => {
      const points: THREE.Vector2[] = []
      for (let i = 0; i <= 50; i++) {
        const x = (i / 50 - 0.5) * 1000
        const y = Math.sin(i * 0.1) * layer.height + Math.sin(i * 0.05) * layer.height * 0.5 + Math.random() * layer.height * 0.2 - 100
        points.push(new THREE.Vector2(x, y))
      }
      points.push(new THREE.Vector2(5000, -300))
      points.push(new THREE.Vector2(-5000, -300))
      const shape = new THREE.Shape(points)
      const mGeo = new THREE.ShapeGeometry(shape)
      const mMat = new THREE.MeshBasicMaterial({ color: layer.color, transparent: true, opacity: layer.opacity, side: THREE.DoubleSide })
      const mountain = new THREE.Mesh(mGeo, mMat)
      mountain.position.z = layer.distance
      mountain.position.y = layer.distance
      mountain.userData = { baseZ: layer.distance, index }
      refs.scene!.add(mountain)
      refs.mountains.push(mountain)
    })

    // Atmosphere
    const atmMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        varying vec3 vNormal; uniform float time;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 atm = vec3(0.3, 0.6, 1.0) * intensity * (sin(time * 2.0) * 0.1 + 0.9);
          gl_FragColor = vec4(atm, intensity * 0.25);
        }
      `,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true,
    })
    refs.scene!.add(new THREE.Mesh(new THREE.SphereGeometry(600, 32, 32), atmMat))

    refs.locations = refs.mountains.map(m => m.position.z)

    // Animate
    const animate = () => {
      refs.animationId = requestAnimationFrame(animate)
      const time = Date.now() * 0.001

      refs.stars.forEach(sf => {
        if (sf.material instanceof THREE.ShaderMaterial) sf.material.uniforms.time.value = time
      })
      if (refs.nebula?.material instanceof THREE.ShaderMaterial) {
        refs.nebula.material.uniforms.time.value = time * 0.5
      }

      if (refs.camera && refs.targetCameraX !== undefined) {
        const s = 0.05
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * s
        smoothCameraPos.current.y += ((refs.targetCameraY ?? 0) - smoothCameraPos.current.y) * s
        smoothCameraPos.current.z += ((refs.targetCameraZ ?? 0) - smoothCameraPos.current.z) * s
        refs.camera.position.x = smoothCameraPos.current.x + Math.sin(time * 0.1) * 2
        refs.camera.position.y = smoothCameraPos.current.y + Math.cos(time * 0.15) * 1
        refs.camera.position.z = smoothCameraPos.current.z
        refs.camera.lookAt(0, 10, -600)
      }

      refs.mountains.forEach((mountain, i) => {
        const pf = 1 + i * 0.5
        mountain.position.x = Math.sin(time * 0.1) * 2 * pf
        mountain.position.y = 50 + Math.cos(time * 0.15) * pf
      })

      refs.composer?.render()
    }
    animate()
    setIsReady(true)

    const handleResize = () => {
      if (!refs.camera || !refs.renderer || !refs.composer) return
      refs.camera.aspect = window.innerWidth / window.innerHeight
      refs.camera.updateProjectionMatrix()
      refs.renderer.setSize(window.innerWidth, window.innerHeight)
      refs.composer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)
      window.removeEventListener('resize', handleResize)
      refs.stars.forEach(sf => { sf.geometry.dispose(); (sf.material as THREE.Material).dispose() })
      refs.mountains.forEach(m => { m.geometry.dispose(); (m.material as THREE.Material).dispose() })
      if (refs.nebula) { refs.nebula.geometry.dispose(); (refs.nebula.material as THREE.Material).dispose() }
      refs.renderer?.dispose()
    }
  }, [])

  // GSAP intro — dynamic import (SSR/build-safe)
  useEffect(() => {
    if (!isReady) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tl: any = null
    import('gsap').then(({ gsap }) => {
      const els = [menuRef.current, titleRef.current, subtitleRef.current, formRef.current, progressRef.current].filter(Boolean)
      gsap.set(els, { visibility: 'visible' })
      tl = gsap.timeline()
      if (menuRef.current) tl.from(menuRef.current, { x: -60, opacity: 0, duration: 1, ease: 'power3.out' })
      if (titleRef.current) {
        tl.from(titleRef.current.querySelectorAll('.tc'), { y: 120, opacity: 0, duration: 1.4, stagger: 0.04, ease: 'power4.out' }, '-=0.5')
      }
      if (subtitleRef.current) {
        tl.from(subtitleRef.current.querySelectorAll('.sl'), { y: 40, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }, '-=0.8')
      }
      if (formRef.current) tl.from(formRef.current, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      if (progressRef.current) tl.from(progressRef.current, { opacity: 0, y: 20, duration: 0.8 }, '-=0.4')
    })
    return () => { tl?.kill() }
  }, [isReady])

  // Scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const containerH = containerRef.current?.offsetHeight ?? window.innerHeight * 3
      const heroRange = containerH - window.innerHeight
      const progress = Math.min(scrollY / heroRange, 1)

      setScrollProgress(progress)
      const sec = Math.min(Math.floor(progress * (totalSections + 1)), totalSections)
      setCurrentSection(sec)

      const refs = threeRefs.current
      const totalProg = progress * totalSections
      const secProg = totalProg % 1
      const secIdx = Math.floor(totalProg)

      const camPositions = [
        { x: 0, y: 30, z: 300 },
        { x: 0, y: 40, z: -50 },
        { x: 0, y: 50, z: -700 },
      ]
      const cur = camPositions[secIdx] ?? camPositions[0]
      const nxt = camPositions[secIdx + 1] ?? cur
      refs.targetCameraX = cur.x + (nxt.x - cur.x) * secProg
      refs.targetCameraY = cur.y + (nxt.y - cur.y) * secProg
      refs.targetCameraZ = cur.z + (nxt.z - cur.z) * secProg

      refs.mountains.forEach((m, i) => {
        const speed = 1 + i * 0.9
        if (refs.nebula) refs.nebula.position.z = (m.userData.baseZ + scrollY * speed * 0.5) - 100
        if (progress > 0.7) {
          m.position.z = 600000
        } else if (refs.locations) {
          m.position.z = refs.locations[i]
        }
      })
      if (refs.nebula && refs.mountains[3]) {
        refs.nebula.position.z = refs.mountains[3].position.z
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [totalSections])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    onFormSubmit?.(formData)
    const payload = {
      access_key: '3c20d34e-3dfe-4ba8-a445-2265ac77ddcb',
      subject: `Ucretsiz Analiz Talebi - ${formData.isletmeAdi}`,
      from_name: '404 Dijital Form',
      message: `Isletme: ${formData.isletmeAdi}\nTelefon: ${formData.telefon}`,
      email: 'form@404dijital.com',
    }
    await Promise.all([
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {}),
      fetch('/api/iletisim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'analiz', ...formData }) }).catch(() => {}),
    ])
  }

  const content = SECTION_CONTENT[currentSection] ?? SECTION_CONTENT[0]

  return (
    <div ref={containerRef} id="home" className="relative bg-black" style={{ height: '300vh' }}>
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Side menu */}
        <div ref={menuRef} className="absolute left-5 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-5" style={{ visibility: 'hidden' }}>
          <div className="flex flex-col gap-[5px] cursor-pointer group">
            <span className="block w-5 h-px bg-white/50 group-hover:bg-white transition-colors" />
            <span className="block w-3 h-px bg-white/50 group-hover:bg-white transition-colors" />
            <span className="block w-5 h-px bg-white/50 group-hover:bg-white transition-colors" />
          </div>
          <span className="text-white/25 text-[8px] font-montserrat tracking-[0.35em] uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
            404
          </span>
        </div>

        {/* Main content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 sm:px-6 pointer-events-none">
          <div className="text-center max-w-4xl w-full">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-md border border-white/15 text-white text-[10px] font-montserrat font-bold px-4 py-2 rounded-full mb-7 tracking-[0.15em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffc107] animate-pulse" />
              {content.badge}
            </div>

            {/* Title */}
            <h1
              ref={titleRef}
              key={content.title}
              className="font-bebas leading-none tracking-wider mb-4 overflow-hidden"
              style={{
                fontSize: 'clamp(3.5rem, 11vw, 9rem)',
                color: '#ffffff',
                textShadow: '0 0 40px rgba(255,255,255,0.15)',
                visibility: 'hidden',
              }}
            >
              {content.title.split('').map((char, i) => (
                <span key={i} className="tc inline-block">{char === ' ' ? '\u00A0' : char}</span>
              ))}
            </h1>

            {/* Subtitle */}
            <div ref={subtitleRef} className="mb-8" style={{ visibility: 'hidden' }}>
              <p className="sl text-white/80 font-montserrat font-semibold text-base md:text-xl tracking-wider uppercase mb-2">
                {content.subtitle}
              </p>
              <p className="sl text-white/40 font-montserrat text-sm md:text-base font-light">
                {content.desc}
              </p>
            </div>

            {/* Form or CTA */}
            <div ref={formRef} className="pointer-events-auto" style={{ visibility: 'hidden' }}>
              {!formSubmitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                  <input
                    type="text"
                    placeholder="İşletme Adı"
                    value={formData.isletmeAdi}
                    onChange={e => setFormData(p => ({ ...p, isletmeAdi: e.target.value }))}
                    className="flex-1 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-sm font-montserrat text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Telefon Numarası"
                    value={formData.telefon}
                    onChange={e => setFormData(p => ({ ...p, telefon: e.target.value }))}
                    className="flex-1 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-sm font-montserrat text-white placeholder-white/35 focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#ffc107] hover:bg-[#ffca2c] text-[#1a1a1a] font-montserrat font-extrabold text-[10px] px-6 py-3 rounded-xl whitespace-nowrap tracking-wider uppercase transition-all hover:shadow-[0_0_30px_rgba(255,193,7,0.35)] hover:-translate-y-0.5"
                  >
                    ÜCRETSİZ ANALİZ İSTE
                  </button>
                </form>
              ) : (
                <div className="bg-green-500/10 backdrop-blur-md border border-green-500/25 rounded-2xl px-6 py-4 max-w-sm mx-auto">
                  <p className="text-green-400 font-montserrat font-semibold text-sm">✅ Talebiniz alındı!</p>
                  <p className="text-green-400/60 text-xs mt-1 font-montserrat">24 saat içinde sizi arayacağız.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll progress */}
        <div ref={progressRef} className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3" style={{ visibility: 'hidden' }}>
          <span className="text-white/25 text-[8px] font-montserrat tracking-[0.3em] uppercase">SCROLL</span>
          <div className="w-20 h-px bg-white/10 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white/50 transition-all duration-150"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="text-white/25 text-[8px] font-montserrat tracking-widest">
            {String(currentSection + 1).padStart(2, '0')} / {String(totalSections + 1).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  )
}
