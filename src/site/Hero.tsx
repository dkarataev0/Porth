import { useRef } from 'react'
import { gsap, SplitText, prefersReduced, useGSAP } from '../lib/motion'
import { Magnetic } from '../components/Magnetic'
import { scrollToTarget } from '../lib/lenis'
import { Ribbons } from './Ribbons'

const MARQUEE = ['Лендинги', 'Motion-дизайн', 'Озвучка', 'Промо-видео', 'ИИ-интеграции', 'Интерактив']

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReduced()) {
        gsap.from('.hero-inner > *', { opacity: 0, duration: 0.8, stagger: 0.1 })
        return
      }
      const name = SplitText.create('.hero-name .hl', { type: 'chars', mask: 'chars', aria: 'none' })
      const tag = SplitText.create('.hero-tag', { type: 'words', aria: 'none' })
      const tl = gsap.timeline({ delay: 0.35, defaults: { ease: 'expo.out' } })
      tl.from(name.chars, { yPercent: 115, rotation: 6, duration: 1.2, stagger: 0.035 })
        .from(tag.words, { y: 24, opacity: 0, duration: 0.9, stagger: 0.04 }, 0.45)
        .from('.hero-cta > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.8)
        .from('.hero-chips li', { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'back.out(2)' }, 0.9)
        .from('.hero-scroll', { opacity: 0, y: -10, duration: 0.8 }, 1.3)

      // уход hero при скролле
      gsap.to('.hero-inner', {
        yPercent: -12,
        opacity: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      // параллакс свечения за курсором
      const mx = gsap.quickTo('.hero-glow', 'x', { duration: 1.2, ease: 'power3' })
      const my = gsap.quickTo('.hero-glow', 'y', { duration: 1.2, ease: 'power3' })
      const move = (e: PointerEvent) => {
        mx((e.clientX / window.innerWidth - 0.5) * 120)
        my((e.clientY / window.innerHeight - 0.5) * 80)
      }
      window.addEventListener('pointermove', move, { passive: true })
      return () => window.removeEventListener('pointermove', move)
    },
    { scope: root },
  )

  return (
    <section ref={root} id="top" className="hero">
      <div className="hero-bg" aria-hidden="true">
        <span className="hero-glow" />
        <Ribbons />
      </div>
      <div className="hero-inner">
        <h1 className="hero-name" aria-label="Даниил Каратаев">
          <span className="hl">Даниил</span>
          <span className="hl">Каратаев</span>
        </h1>
        <p className="hero-tag">Превращаю идеи в сайты, которые запоминаются</p>
        <div className="hero-cta">
          <Magnetic as="a" href="#works" className="btn btn-lime" onClick={(e: React.MouseEvent) => (e.preventDefault(), scrollToTarget('#works'))}>
            Смотреть работы
          </Magnetic>
          <Magnetic as="a" href="#contacts" className="btn btn-ghost" onClick={(e: React.MouseEvent) => (e.preventDefault(), scrollToTarget('#contacts'))}>
            Обсудить проект
          </Magnetic>
        </div>
        <ul className="hero-chips" aria-label="Что делаю">
          {MARQUEE.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}

