import { useRef } from 'react'
import { gsap, SplitText, isMobile } from '../lib/motion'
import { PROJECTS } from '../data'
import { Preview } from '../components/Preview'
import { sound } from '../audio/sound'
import { karaoke, useScene } from './useScene'

export const WORKS_TEXT =
  'Вот что мы уже сделали. Сайт зип-систем Алютек в Краснодаре. Шоколад, который не описать пером. И сайт, который вы сейчас смотрите.'

export function Works({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLElement>(null)

  useScene({
    scope: root,
    voiceKey: 'scene3',
    text: WORKS_TEXT,
    nominal: 10,
    onDone,
    build: ({ root, tl, D, at }) => {
      const cards = Array.from(root.querySelectorAll<HTMLElement>('.tcard'))
      const stage = root.querySelector<HTMLElement>('.tunnel')!
      const head = SplitText.create(root.querySelector('.scene-title'), { type: 'chars', aria: 'none' })
      const cap = SplitText.create(root.querySelector('.caption'), { type: 'words', aria: 'none' })
      const m = isMobile()
      const cam = { v: -1.25 }

      const place = () => {
        const W = stage.clientWidth
        const spacing = m ? 620 : 820
        cards.forEach((el, i) => {
          const d = i - cam.v
          const side = i % 2 ? 1 : -1
          let x: number, z: number, ry: number, o: number
          if (d >= 0) {
            const e = Math.min(d, 1.6)
            x = side * Math.pow(e, 0.85) * W * (m ? 0.2 : 0.3)
            z = -d * spacing
            ry = -side * Math.min(d, 1) * 26
            o = Math.max(0, 1 - d * 0.34)
          } else {
            const e = -d
            x = side * e * W * 0.75
            z = e * spacing * 0.8
            ry = side * e * 42
            o = Math.max(0, 1 - e * 2.4)
          }
          gsap.set(el, { x, z, rotationY: ry, autoAlpha: o, zIndex: Math.round(1000 - Math.abs(d) * 120), pointerEvents: o > 0.6 ? 'auto' : 'none' })
        })
      }
      place()

      tl.from(head.chars, { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.03, ease: 'back.out(1.6)' }, 0.05)
      karaoke(tl, cap.words, D, 0.1)

      // «Камера» летит по тоннелю: каждый проект выезжает вперёд, когда голос его называет.
      const a1 = Math.max(0.9, at('Сайт зип') + 0.1)
      const a2 = at('Шоколад')
      const a3 = at('И сайт')
      const fly = (to: number, start: number, dur: number, ease: string) => {
        tl.to(cam, { v: to, duration: dur, ease, onUpdate: place }, start)
        tl.call(() => sound.whoosh(true), [], start)
      }
      fly(0, 0.15, Math.min(a1 + 0.5, a2 - 0.7), 'power3.out')
      fly(1, a2 - 0.55, 1.15, 'power2.inOut')
      fly(2, a3 - 0.55, 1.15, 'power2.inOut')
    },
    exit: (tl, root) => {
      const cards = Array.from(root.querySelectorAll<HTMLElement>('.tcard'))
      tl.to(cards, { scale: 1.5, opacity: 0, duration: 0.65, ease: 'power3.in', stagger: 0.04 })
      tl.to(root.querySelectorAll('.scene-title, .caption'), { opacity: 0, y: -30, duration: 0.4 }, 0)
    },
  })

  return (
    <section ref={root} className="scene scene-works" aria-label="Наши работы">
      <h2 className="scene-title">Наши работы</h2>
      <div className="tunnel">
        {PROJECTS.map((p, i) => (
          <article key={p.id} className="tcard" data-cursor="Листать">
            <Preview project={p} eager={i < 2} />
            <div className="tcard-info">
              <h3>{p.title}</h3>
              <p>{p.subtitle}</p>
            </div>
          </article>
        ))}
        <article className="tcard tcard-cta">
          <h3>Ваш проект</h3>
          <p>Следующий кейс — ваш</p>
        </article>
      </div>
      <p className="caption">{WORKS_TEXT}</p>
    </section>
  )
}
