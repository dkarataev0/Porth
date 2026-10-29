import { isMobile } from '../lib/motion'

interface P {
  sx: number
  sy: number
  tx: number
  ty: number
  d: number
  swirl: number
  c: number
}

const COLORS = ['#2d5bff', '#a24bff', '#c6ff1a']
const TRAIL = 46

/**
 * Световые линии, которые собираются в текст. Цели берутся из пикселей самого текста,
 * поэтому частицы встают ровно туда, где потом окажутся буквы.
 */
export function createNameParticles(canvas: HTMLCanvasElement, lines: HTMLElement[]) {
  const mobile = isMobile()
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5)
  const W = window.innerWidth
  const H = window.innerHeight
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')!

  // 1. рисуем текст во вспомогательный холст и собираем «горячие» пиксели
  const off = document.createElement('canvas')
  off.width = W
  off.height = H
  const o = off.getContext('2d', { willReadFrequently: true })!
  o.fillStyle = '#fff'
  o.textBaseline = 'alphabetic'
  lines.forEach((el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    ;(o as unknown as { letterSpacing: string }).letterSpacing = cs.letterSpacing
    const fs = parseFloat(cs.fontSize)
    // Базовая линия: центр строки + 0.35em (для заглавных/строчных Unbounded визуально ровно).
    o.fillText(el.textContent || '', r.left, r.top + r.height / 2 + fs * 0.34)
  })
  const data = o.getImageData(0, 0, W, H).data
  const step = mobile ? 4 : 3
  const pts: [number, number][] = []
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (data[(y * W + x) * 4 + 3] > 140) pts.push([x, y])
    }
  }
  const count = Math.min(pts.length, mobile ? 700 : 2400)
  for (let i = pts.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[pts[i], pts[j]] = [pts[j], pts[i]]
  }

  const parts: P[] = []
  const minX = Math.min(...pts.slice(0, count).map((p) => p[0]))
  const maxX = Math.max(...pts.slice(0, count).map((p) => p[0]))
  for (let i = 0; i < count; i++) {
    const [tx, ty] = pts[i]
    const a = Math.random() * Math.PI * 2
    const rad = Math.max(W, H) * (0.6 + Math.random() * 0.5)
    const sx = W / 2 + Math.cos(a) * rad
    const sy = H / 2 + Math.sin(a) * rad
    const k = (tx - minX) / Math.max(1, maxX - minX)
    parts.push({
      sx,
      sy,
      tx,
      ty,
      d: Math.random() * 0.4,
      swirl: (Math.random() - 0.5) * 520,
      c: k < 0.38 ? 0 : k < 0.7 ? 1 : 2,
    })
  }

  const ease = (t: number) => 1 - Math.pow(1 - t, 3)

  const pos = (q: P, p: number, out: [number, number]) => {
    const t = ease(Math.min(1, Math.max(0, (p - q.d) / 0.6)))
    const inv = 1 - t
    // Лёгкий изгиб траектории: линии «закручиваются» к цели.
    out[0] = q.sx + (q.tx - q.sx) * t + q.swirl * inv * inv * Math.sin(t * 2.6)
    out[1] = q.sy + (q.ty - q.sy) * t - q.swirl * inv * inv * Math.cos(t * 2.6)
  }
  const a: [number, number] = [0, 0]
  const b: [number, number] = [0, 0]

  /** p: 0→1 сборка; fade: 0→1 растворение. */
  function draw(p: number, fade: number) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    if (fade >= 1) return
    ctx.lineCap = 'round'
    ctx.globalAlpha = 1 - fade
    ctx.lineWidth = mobile ? 1.6 : 2
    for (let c = 0; c < 3; c++) {
      ctx.beginPath()
      ctx.strokeStyle = COLORS[c]
      for (const q of parts) {
        if (q.c !== c) continue
        pos(q, p, a)
        pos(q, Math.max(0, p - 0.05), b)
        // след не длиннее TRAIL px, иначе в полёте получается «ёж» из длинных линий
        const dx = a[0] - b[0]
        const dy = a[1] - b[1]
        const len = Math.hypot(dx, dy)
        if (len > TRAIL) {
          b[0] = a[0] - (dx * TRAIL) / len
          b[1] = a[1] - (dy * TRAIL) / len
        }
        ctx.moveTo(b[0], b[1])
        ctx.lineTo(a[0] + 0.01, a[1])
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  return { draw, count }
}
