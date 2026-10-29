import { useRef } from 'react'
import { gsap, SplitText, isMobile, prefersReduced, useGSAP } from '../lib/motion'
import { PROCESS } from '../data'

/** Таймлайн, который «рисуется» при скролле: линия (DrawSVG) + светящаяся точка + шаги по очереди. */
export function Process() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduce = prefersReduced()
      const head = SplitText.create('.process-title', { type: 'words', mask: 'words', aria: 'none' })
      gsap.from(head.words, { yPercent: 110, duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.process-title', start: 'top 85%' } })

      const steps = gsap.utils.toArray<HTMLElement>('.pstep')
      if (reduce) {
        gsap.from(steps, { opacity: 0, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: '.ptimeline', start: 'top 80%' } })
        gsap.set('.pline-fill', { drawSVG: '100%' })
        return
      }
      const track = '.ptimeline'
      gsap.fromTo(
        '.pline-fill',
        { drawSVG: '0%' },
        { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: track, start: 'top 65%', end: 'bottom 60%', scrub: 0.6 } },
      )
      gsap.fromTo(
        '.phead',
        { y: 0 },
        {
          y: () => (document.querySelector<HTMLElement>('.ptimeline')?.offsetHeight ?? 0),
          ease: 'none',
          scrollTrigger: { trigger: track, start: 'top 65%', end: 'bottom 60%', scrub: 0.6, invalidateOnRefresh: true },
        },
      )
      steps.forEach((step, i) => {
        const side = i % 2 ? 1 : -1
        const m = isMobile()
        gsap.set(step.querySelector('.pcard'), { x: m ? 0 : side * 60, y: m ? 40 : 0, opacity: 0 })
        gsap.timeline({ scrollTrigger: { trigger: step, start: 'top 68%', toggleActions: 'play none none reverse' } })
          .to(step.querySelector('.pnode'), { scale: 1, backgroundColor: '#c6ff1a', duration: 0.4, ease: 'back.out(3)' }, 0)
          .to(step.querySelector('.pcard'), { x: 0, y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, 0.05)
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="process" className="process">
      <div className="sec-head">
        <h2 className="h2 process-title">Как строится работа</h2>
        <p className="lead">Пять шагов от первой идеи до запуска. На каждом вы видите результат и можете повлиять на него.</p>
      </div>
      <div className="ptimeline">
        <svg className="pline" viewBox="0 0 4 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="pgrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2d5bff" />
              <stop offset=".55" stopColor="#a24bff" />
              <stop offset="1" stopColor="#c6ff1a" />
            </linearGradient>
          </defs>
          <line className="pline-base" x1="2" y1="0" x2="2" y2="100" />
          <line className="pline-fill" x1="2" y1="0" x2="2" y2="100" stroke="url(#pgrad)" />
        </svg>
        <span className="phead" aria-hidden="true" />
        <ol className="psteps">
          {PROCESS.map((s, i) => (
            <li key={s.title} className={`pstep ${i % 2 ? 'right' : 'left'}`}>
              <span className="pnode" aria-hidden="true" />
              <div className="pcard">
                <span className="pnum">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
