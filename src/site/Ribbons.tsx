import { useEffect, useRef } from 'react'
import { isMobile, prefersReduced } from '../lib/motion'

/** Фон hero: неоновые ленты, реагирующие на курсор. Рисуются только пока hero в зоне видимости. */
export function Ribbons() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const mobile = isMobile()
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5)
    const N = mobile ? 4 : 7
    const SEG = mobile ? 40 : 72
    let W = 0
    let H = 0
    let raf = 0
    let visible = true
    let t = 0
    const mouse = { x: 0.7, y: 0.5, tx: 0.7, ty: 0.5 }

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
    }
    resize()

    const frame = () => {
      raf = 0
      if (!visible) return
      t += 0.012
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      const grad = ctx.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0, 'rgba(45,91,255,0)')
      grad.addColorStop(0.25, 'rgba(45,91,255,.9)')
      grad.addColorStop(0.6, 'rgba(162,75,255,.95)')
      grad.addColorStop(0.9, 'rgba(198,255,26,.9)')
      grad.addColorStop(1, 'rgba(198,255,26,0)')
      ctx.strokeStyle = grad
      ctx.lineCap = 'round'
      for (let k = 0; k < N; k++) {
        const base = H * (0.42 + (k / N) * 0.38) + (mouse.y - 0.5) * 60
        const amp = 28 + k * 11
        ctx.globalAlpha = 0.5 - k * 0.04
        ctx.lineWidth = 1 + (N - k) * 0.28
        ctx.beginPath()
        for (let i = 0; i <= SEG; i++) {
          const u = i / SEG
          const x = u * W
          const near = Math.exp(-Math.pow((u - mouse.x) * 3.2, 2))
          const y =
            base +
            Math.sin(u * 5.2 + t * (1 + k * 0.12) + k) * amp +
            Math.sin(u * 11 - t * 1.4 + k * 2) * amp * 0.25 * (1 + near * 2.4) -
            near * 46
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }
    if (prefersReduced()) {
      t = 1.3
      frame()
      cancelAnimationFrame(raf)
      raf = 0
      visible = false
    } else start()

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !prefersReduced()) start()
    })
    io.observe(canvas)
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = e.clientY / window.innerHeight
    }
    const onVis = () => (document.hidden ? cancelAnimationFrame(raf) : start())
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="ribbons" aria-hidden="true" />
}
