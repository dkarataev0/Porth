import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReduced } from './motion'

let lenis: Lenis | null = null

export function startLenis() {
  if (lenis || prefersReduced()) return
  lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
}

function tick(time: number) {
  lenis?.raf(time * 1000)
}

export function stopLenis() {
  lenis?.stop()
}
export function resumeLenis() {
  lenis?.start()
}

export function scrollToTarget(target: string | number | HTMLElement, immediate = false) {
  if (lenis) lenis.scrollTo(target as never, { duration: immediate ? 0 : 1.6, immediate, easing: (t: number) => 1 - Math.pow(1 - t, 4) })
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
  else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
    el?.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
  }
}
