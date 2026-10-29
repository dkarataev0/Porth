import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, Flip, ScrollTrigger, SplitText, prefersReduced, useGSAP } from '../lib/motion'
import { PROJECTS, type Project } from '../data'
import { Preview } from '../components/Preview'
import { CaseView } from './CaseView'
import { scrollToTarget } from '../lib/lenis'

export function Portfolio() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState<{ project: Project; state: Flip.FlipState | null } | null>(null)
  const pending = useRef<{ id: string; state: Flip.FlipState | null } | null>(null)

  useGSAP(
    () => {
      const reduce = prefersReduced()
      const head = SplitText.create('.works-title', { type: 'words', mask: 'words', aria: 'none' })
      gsap.from(head.words, { yPercent: 110, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.works-title', start: 'top 85%' } })
      ScrollTrigger.batch('.wcard', {
        start: 'top 90%',
        once: true,
        onEnter: (els) => gsap.from(els, { y: reduce ? 0 : 80, opacity: 0, rotationX: reduce ? 0 : -10, transformPerspective: 900, duration: 1, stagger: 0.12, ease: 'power3.out' }),
      })
    },
    { scope: root },
  )

  const open = (p: Project, card: HTMLElement) => {
    const media = card.querySelector<HTMLElement>('[data-flip-id]')!
    const state = prefersReduced() ? null : Flip.getState(media)
    setActive({ project: p, state })
  }

  // Возврат: превью перелетает обратно в карточку.
  useLayoutEffect(() => {
    const p = pending.current
    if (!p || active) return
    pending.current = null
    const media = root.current?.querySelector<HTMLElement>(`[data-flip-id="media-${p.id}"]`)
    if (media && p.state) {
      gsap.set(media, { visibility: 'visible' })
      Flip.from(p.state, { targets: media, duration: 0.8, ease: 'expo.inOut', scale: true, absolute: true })
    }
  }, [active])

  const close = (state: Flip.FlipState | null) => {
    pending.current = active ? { id: active.project.id, state } : null
    const el = document.querySelector('.case')
    if (el) gsap.to(el, { opacity: 0, duration: 0.45, ease: 'power2.out' })
    window.setTimeout(() => setActive(null), 80)
  }

  const nextOf = (p: Project) => PROJECTS[(PROJECTS.findIndex((x) => x.id === p.id) + 1) % PROJECTS.length]

  return (
    <section ref={root} id="works" className="works">
      <div className="sec-head">
        <h2 className="h2 works-title">Работы</h2>
        <p className="lead">Наведите на карточку — сайт прокрутится внутри. Нажмите, чтобы открыть кейс.</p>
      </div>
      <div className="works-grid">
        {PROJECTS.map((p) => (
          <article key={p.id} className="wcard">
            <button type="button" className="wcard-btn" data-cursor="Открыть" aria-label={`Открыть кейс: ${p.title}`} onClick={(e) => open(p, e.currentTarget.closest('.wcard') as HTMLElement)}>
              <Preview project={p} flipId={`media-${p.id}`} className="pv-card" />
              <span className="wcard-meta">
                <span className="wcard-title">{p.title}</span>
                <span className="wcard-sub">{p.subtitle}</span>
                <span className="chips">
                  {p.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
              </span>
            </button>
          </article>
        ))}
        <a
          className="wcard wcard-cta"
          href="#contacts"
          data-cursor="Написать"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget('#contacts')
          }}
        >
          <span className="wcard-cta-title">Ваш проект</span>
          <span className="wcard-cta-text">Следующий кейс в этой сетке может быть вашим. Расскажите, что нужно сделать.</span>
          <span className="btn btn-lime btn-sm">Обсудить</span>
        </a>
      </div>
      {active && (
        <CaseView
          project={active.project}
          next={nextOf(active.project)}
          state={active.state}
          onClose={close}
          onNext={(p) => setActive({ project: p, state: null })}
        />
      )}
    </section>
  )
}
