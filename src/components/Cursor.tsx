import { useRef } from 'react'
import { gsap, isTouch, prefersReduced, useGSAP } from '../lib/motion'

/** Кастомный курсор: точка + кольцо. Кольцо растёт на интерактивных элементах и показывает подпись из data-cursor. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    if (isTouch() || prefersReduced()) return
    document.documentElement.classList.add('has-cursor')
    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50, opacity: 0 })
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'none' })
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'none' })
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3' })
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3' })
    let shown = false
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY })
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3 })
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor], a, button, input, textarea, label')
      const text = t?.dataset.cursor
      const state = text ? 'label' : t ? 'link' : 'idle'
      if (label.current) label.current.textContent = text || ''
      gsap.to(ring.current, {
        scale: state === 'label' ? 2.4 : state === 'link' ? 1.7 : 1,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      })
      gsap.to(dot.current, { scale: state === 'idle' ? 1 : 0, duration: 0.25, overwrite: 'auto' })
      ring.current?.classList.toggle('is-label', state === 'label')
    }
    const leave = () => {
      shown = false
      gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 })
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  })

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
