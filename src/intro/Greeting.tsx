import { useRef } from 'react'
import { gsap, SplitText, isMobile } from '../lib/motion'
import { createNameParticles } from './particles'
import { karaoke, useScene } from './useScene'

export const GREETING_TEXT = 'Привет! Меня зовут Даниил Каратаев. Я превращаю идеи в сайты, которые запоминаются.'

export function Greeting({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useScene({
    scope: root,
    voiceKey: 'scene1',
    text: GREETING_TEXT,
    nominal: 6,
    onDone,
    build: ({ root, tl, D, at }) => {
      const lines = Array.from(root.querySelectorAll<HTMLElement>('.gl'))
      const p = createNameParticles(canvas.current!, lines)
      const st = { p: 0, fade: 0 }
      const redraw = () => p.draw(st.p, st.fade)

      const split = SplitText.create(lines, { type: 'chars', charsClass: 'gc', aria: 'none' })
      const sub = SplitText.create(root.querySelector('.greet-sub'), { type: 'words', aria: 'none' })
      const cap = SplitText.create(root.querySelector('.caption'), { type: 'words', aria: 'none' })
      const m = isMobile()

      gsap.set(split.chars, { opacity: 0 })
      gsap.set(sub.words, { opacity: 0, y: 24 })

      // 1. световые линии собираются в имя
      tl.to(st, { p: 1, duration: Math.min(2.4, D * 0.42), ease: 'power2.inOut', onUpdate: redraw }, 0.1)
      // 2. буквы разлетаются из случайных точек и встают на место
      tl.fromTo(
        split.chars,
        {
          x: () => gsap.utils.random(-(m ? 220 : 720), m ? 220 : 720),
          y: () => gsap.utils.random(-(m ? 300 : 420), m ? 300 : 420),
          rotation: () => gsap.utils.random(-140, 140),
          scale: () => gsap.utils.random(0.2, 2.2),
          opacity: 0,
        },
        { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.5, ease: 'expo.out', stagger: { each: 0.05, from: 'random' } },
        Math.min(2.0, D * 0.34),
      )
      tl.to(st, { fade: 1, duration: 0.9, ease: 'power1.out', onUpdate: redraw }, Math.min(2.5, D * 0.4))
      tl.call(() => {
        // тихий «щелчок» в момент посадки букв
        import('../audio/sound').then(({ sound }) => sound.hit(520))
      }, [], Math.min(2.5, D * 0.4))
      // 3. слоган — вместе с фразой «Я превращаю…»
      tl.to(sub.words, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, Math.max(2.6, at('Я превращаю') - 0.2))
      karaoke(tl, cap.words, D, 0.1)
    },
    exit: (tl, root) => {
      tl.to(root.querySelectorAll('.greet-name, .greet-sub, .caption'), { y: -60, opacity: 0, scale: 0.92, duration: 0.6, ease: 'power3.in', stagger: 0.04 })
    },
  })

  return (
    <section ref={root} className="scene scene-greet" aria-label="Приветствие">
      <canvas ref={canvas} className="greet-canvas" aria-hidden="true" />
      <div className="greet-name" aria-label="Даниил Каратаев">
        <span className="gl">Даниил</span>
        <span className="gl">Каратаев</span>
      </div>
      <p className="greet-sub">Я превращаю идеи в сайты, которые запоминаются</p>
      <p className="caption">{GREETING_TEXT}</p>
    </section>
  )
}
