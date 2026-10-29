import { useRef } from 'react'
import { SplitText, isMobile } from '../lib/motion'
import { SKILLS } from '../data'
import { SkillIcon, animateIcon } from '../components/SkillIcon'
import { sound } from '../audio/sound'
import { karaoke, useScene } from './useScene'

export const SKILLS_TEXT =
  'Вот что я умею. Лендинги и сайты под ключ. Анимации и motion-дизайн. Сайты с озвучкой и интерактивом. Промо-видео. И ИИ-интеграции.'
const PHRASES = ['Лендинги', 'Анимации', 'Сайты с озвучкой', 'Промо-видео', 'ИИ-интеграции']

export function Skills({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLElement>(null)

  useScene({
    scope: root,
    voiceKey: 'scene2',
    text: SKILLS_TEXT,
    nominal: 10,
    onDone,
    build: ({ root, tl, D, at }) => {
      const cards = Array.from(root.querySelectorAll<HTMLElement>('.skill-card'))
      const head = SplitText.create(root.querySelector('.scene-title'), { type: 'chars', aria: 'none' })
      const cap = SplitText.create(root.querySelector('.caption'), { type: 'words', aria: 'none' })
      const m = isMobile()

      tl.from(head.chars, { yPercent: 110, opacity: 0, rotationX: -80, duration: 0.7, stagger: 0.03, ease: 'back.out(1.6)' }, 0.05)
      karaoke(tl, cap.words, D, 0.1)

      cards.forEach((card, i) => {
        const side = i % 2 ? 1 : -1
        const arrive = Math.max(0.5, at(PHRASES[i]) - 0.55)
        const glow = card.querySelector('.skill-glow')
        tl.fromTo(
          card,
          {
            x: m ? side * 160 : side * 380,
            y: m ? 20 : 140,
            z: -900,
            rotationY: side * -78,
            rotationX: 26,
            opacity: 0,
            transformPerspective: 1100,
          },
          { x: 0, y: 0, z: 0, rotationY: 0, rotationX: 0, opacity: 1, duration: 1.0, ease: 'back.out(1.25)' },
          arrive,
        )
        tl.call(() => sound.whoosh(i % 2 === 0), [], arrive + 0.05)
        tl.call(() => sound.hit(480 + i * 90), [], arrive + 0.75)
        tl.call(() => animateIcon(card.querySelector('svg')!, SKILLS[i].id), [], arrive + 0.5)
        // подсветка в момент, когда голос называет навык
        const t0 = at(PHRASES[i])
        const t1 = i < PHRASES.length - 1 ? at(PHRASES[i + 1]) - 0.1 : D
        tl.to(card, { scale: 1.07, y: -10, duration: 0.3, ease: 'power2.out' }, t0)
        tl.to(glow, { opacity: 1, duration: 0.3 }, t0)
        tl.to(card, { scale: 1, y: 0, duration: 0.5, ease: 'power2.inOut' }, Math.max(t0 + 0.4, t1))
        tl.to(glow, { opacity: 0.0, duration: 0.5 }, Math.max(t0 + 0.4, t1))
      })
    },
    exit: (tl, root) => {
      tl.to(root.querySelectorAll('.skill-card'), { y: -90, scale: 0.8, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power3.in' })
      tl.to(root.querySelectorAll('.scene-title, .caption'), { opacity: 0, y: -30, duration: 0.4 }, 0)
    },
  })

  return (
    <section ref={root} className="scene scene-skills" aria-label="Что я умею">
      <h2 className="scene-title">Что я умею</h2>
      <div className="skills-row">
        {SKILLS.map((s) => (
          <article key={s.id} className="skill-card">
            <span className="skill-glow" aria-hidden="true" />
            <SkillIcon id={s.id} />
            <h3>{s.title}</h3>
            <p>{s.short}</p>
          </article>
        ))}
      </div>
      <p className="caption">{SKILLS_TEXT}</p>
    </section>
  )
}
