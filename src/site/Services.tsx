import { useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, prefersReduced, useGSAP } from '../lib/motion'
import { SKILLS } from '../data'
import { SkillIcon, animateIcon } from '../components/SkillIcon'

export function Services() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduce = prefersReduced()
      const panels = gsap.utils.toArray<HTMLElement>('.sv-panel')
      const items = gsap.utils.toArray<HTMLElement>('.sv-list li')
      panels.forEach((p, i) => animateIcon(p.querySelector('svg')!, SKILLS[i].id))

      const head = SplitText.create('.sv-title', { type: 'words', mask: 'words', aria: 'none' })
      gsap.from(head.words, {
        yPercent: 110,
        duration: 1,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.sv-title', start: 'top 85%', toggleActions: 'play none none none' },
      })

      const setActive = (n: number) => items.forEach((li, i) => li.classList.toggle('is-active', i === n))
      setActive(0)

      const mm = gsap.matchMedia()
      mm.add('(min-width: 861px)', () => {
        if (reduce) {
          panels.forEach((p, i) => gsap.set(p, { autoAlpha: i === 0 ? 1 : 0 }))
          items.forEach((li, i) => li.addEventListener('click', () => (setActive(i), panels.forEach((p, j) => gsap.to(p, { autoAlpha: i === j ? 1 : 0, duration: 0.4 })))))
          return
        }
        gsap.set(panels.slice(1), { autoAlpha: 0, y: 90, scale: 0.96 })
        const n = panels.length
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.services-pin',
            start: 'top top',
            end: `+=${n * 90}%`,
            pin: true,
            scrub: 0.7,
            onUpdate: (self) => setActive(Math.min(n - 1, Math.round(self.progress * (n - 1)))),
          },
        })
        tl.to('.sv-progress i', { scaleY: 1, duration: n - 1 }, 0)
        panels.forEach((p, i) => {
          if (!i) return
          tl.to(panels[i - 1], { autoAlpha: 0, y: -90, scale: 0.94, rotationX: 8, duration: 0.5, ease: 'power2.in' }, i - 1 + 0.15)
          tl.fromTo(p, { autoAlpha: 0, y: 90, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: 'power2.out' }, i - 1 + 0.5)
        })
        tl.to({}, { duration: 0.25 })
      })
      mm.add('(max-width: 860px)', () => {
        gsap.set(panels, { autoAlpha: 1 })
        ScrollTrigger.batch(panels, {
          start: 'top 88%',
          once: true,
          onEnter: (els) => gsap.from(els, { y: reduce ? 0 : 60, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }),
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="services" className="services">
      <div className="services-pin">
        <div className="sv-left">
          <h2 className="h2 sv-title">Что я делаю</h2>
          <ul className="sv-list">
            {SKILLS.map((s) => (
              <li key={s.id}>{s.title}</li>
            ))}
          </ul>
          <div className="sv-progress" aria-hidden="true">
            <i />
          </div>
        </div>
        <div className="sv-stage">
          {SKILLS.map((s) => (
            <article key={s.id} className="sv-panel">
              <SkillIcon id={s.id} />
              <h3>{s.title}</h3>
              <p>{s.long}</p>
              <ul className="chips">
                {s.chips.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
