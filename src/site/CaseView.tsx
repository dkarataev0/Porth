import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap, Flip, SplitText } from '../lib/motion'
import type { Project } from '../data'
import { Preview } from '../components/Preview'
import { Magnetic } from '../components/Magnetic'
import { resumeLenis, stopLenis } from '../lib/lenis'
import { sound } from '../audio/sound'

interface Props {
  project: Project
  next: Project
  state: Flip.FlipState | null
  onClose: (state: Flip.FlipState | null) => void
  onNext: (p: Project) => void
}

/** Полноэкранная страница кейса. Превью «перелетает» из карточки через Flip. */
export function CaseView({ project, next, state, onClose, onNext }: Props) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = root.current!
    stopLenis()
    document.documentElement.classList.add('case-open')
    const media = el.querySelector<HTMLElement>('[data-flip-id]')!
    const ctx = gsap.context(() => {
      const title = SplitText.create(el.querySelector('.case-title'), { type: 'words', mask: 'words', aria: 'none' })
      gsap.set(title.words, { yPercent: 110 })
      gsap.set(el.querySelectorAll('.case-meta > *, .case-block, .case-actions > *'), { y: 40, opacity: 0 })
      gsap.set(el.querySelector('.case-bg'), { opacity: 0 })
      const tl = gsap.timeline()
      sound.whoosh()
      tl.to(el.querySelector('.case-bg'), { opacity: 1, duration: 0.45 }, 0)
      if (state) {
        Flip.from(state, { targets: media, duration: 1.0, ease: 'expo.inOut', scale: true, absolute: true, nested: true })
      } else {
        gsap.from(media, { y: 80, opacity: 0, duration: 0.9, ease: 'expo.out' })
      }
      tl.to(title.words, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out' }, 0.55)
        .to(el.querySelectorAll('.case-meta > *'), { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, 0.7)
        .to(el.querySelectorAll('.case-block'), { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0.95)
        .to(el.querySelectorAll('.case-actions > *'), { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 1.2)
    }, el)
    el.scrollTop = 0
    el.focus({ preventScroll: true })
    return () => {
      ctx.revert()
      document.documentElement.classList.remove('case-open')
      if (!document.documentElement.classList.contains('intro-lock')) resumeLenis()
    }
  }, [project.id, state])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const close = () => {
    const el = root.current!
    const media = el.querySelector<HTMLElement>('[data-flip-id]')!
    // фиксируем положение превью, фон и текст уходят, а Portfolio перелетает превью обратно в карточку
    const st = Flip.getState(media)
    gsap.to(el.querySelectorAll('.case-inner > *:not(.case-hero)'), { opacity: 0, y: 30, duration: 0.3 })
    gsap.set(media, { visibility: 'hidden' })
    onClose(st)
  }

  return (
    <div ref={root} className="case" role="dialog" aria-modal="true" aria-label={`Кейс: ${project.title}`} tabIndex={-1} data-lenis-prevent>
      <div className="case-bg" />
      <div className="case-inner">
        <div className="case-top">
          <button type="button" className="btn btn-ghost btn-sm" onClick={close} data-cursor="Назад">
            Назад к работам
          </button>
          <span className="case-year">{project.year}</span>
        </div>
        <h2 className="case-title">{project.title}</h2>
        <div className="case-meta">
          <p>{project.subtitle}</p>
          <ul className="chips">
            {project.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="case-hero">
          <Preview project={project} flipId={`media-${project.id}`} className="pv-case" eager />
        </div>
        <div className="case-grid">
          <section className="case-block">
            <h3>Задача</h3>
            <p>{project.task}</p>
          </section>
          <section className="case-block">
            <h3>Решение</h3>
            <p>{project.solution}</p>
          </section>
          <section className="case-block">
            <h3>Результат</h3>
            <p>{project.result}</p>
          </section>
        </div>
        <p className="case-role">Роль: {project.role}</p>
        <div className="case-actions">
          {project.url && (
            <Magnetic as="a" href={project.url} target="_blank" rel="noopener noreferrer" className="btn btn-lime">
              Открыть сайт
            </Magnetic>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => onNext(next)}>
            Следующий проект: {next.title.replace(/[«»]/g, '').slice(0, 28)}
            {next.title.length > 30 ? '…' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
