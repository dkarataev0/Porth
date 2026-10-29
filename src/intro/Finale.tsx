import { useRef } from 'react'
import { SplitText } from '../lib/motion'
import { Magnetic } from '../components/Magnetic'
import { sound } from '../audio/sound'
import { karaoke, useScene } from './useScene'

export const FINALE_TEXT = 'Давайте создадим ваш проект.'

export function Finale({ onDone, onContact }: { onDone: () => void; onContact: () => void }) {
  const root = useRef<HTMLElement>(null)

  useScene({
    scope: root,
    voiceKey: 'scene4',
    text: FINALE_TEXT,
    nominal: 3,
    onDone,
    build: ({ root, tl, D }) => {
      const title = SplitText.create(root.querySelector('.finale-title'), { type: 'words,chars', aria: 'none', mask: 'words' })
      const cap = SplitText.create(root.querySelector('.caption'), { type: 'words', aria: 'none' })
      tl.from(title.chars, { yPercent: 120, rotation: 8, duration: 0.9, stagger: 0.025, ease: 'expo.out' }, 0.1)
      tl.fromTo(root.querySelectorAll('.finale-ring'), { scale: 0.2, opacity: 0.8 }, { scale: 1.8, opacity: 0, duration: 1.8, stagger: 0.35, ease: 'power2.out', repeat: 2 }, 0.2)
      tl.fromTo(root.querySelector('.finale-btn'), { y: 40, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.8)' }, Math.min(1.2, D * 0.5))
      tl.call(() => sound.hit(740), [], Math.min(1.2, D * 0.5))
      karaoke(tl, cap.words, D, 0.1)
    },
    // Пауза, чтобы увидеть кнопку связи, затем интро сворачивается в главный экран.
    exit: (tl) => {
      tl.to({}, { duration: 1.6 })
    },
  })

  return (
    <section ref={root} className="scene scene-finale" aria-label="Финал">
      <span className="finale-ring" aria-hidden="true" />
      <span className="finale-ring" aria-hidden="true" />
      <h2 className="finale-title">Давайте создадим ваш проект</h2>
      <Magnetic as="button" type="button" className="btn btn-lime finale-btn" onClick={onContact}>
        Обсудить проект
      </Magnetic>
      <p className="caption">{FINALE_TEXT}</p>
    </section>
  )
}
