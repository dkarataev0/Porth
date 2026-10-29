import { gsap } from '../lib/motion'
import type { SkillId } from '../data'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function SkillIcon({ id }: { id: SkillId }) {
  return (
    <svg className="skill-icon" data-icon={id} viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      {id === 'site' && (
        <g>
          <rect className="i-win" x="10" y="16" width="76" height="62" rx="9" {...stroke} />
          <path d="M10 31h76" {...stroke} />
          <circle className="i-dot" cx="21" cy="24" r="2.4" fill="currentColor" />
          <circle className="i-dot" cx="30" cy="24" r="2.4" fill="currentColor" />
          <circle className="i-dot" cx="39" cy="24" r="2.4" fill="currentColor" />
          <rect className="i-bar" x="21" y="41" width="38" height="6" rx="3" fill="var(--lime)" />
          <rect className="i-bar" x="21" y="53" width="54" height="6" rx="3" fill="var(--blue)" />
          <rect className="i-bar" x="21" y="65" width="30" height="6" rx="3" fill="var(--violet)" />
          <path className="i-cursor" d="M60 56l16 7-7 2.4-2.6 7z" fill="#fff" stroke="#07070d" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
      )}
      {id === 'motion' && (
        <g>
          <path d="M12 82h72M12 82V14" {...stroke} opacity=".35" />
          <path className="i-curve" d="M14 74C34 74 30 22 50 22S66 74 84 74" {...stroke} stroke="var(--violet)" />
          <circle className="i-ball" r="7" cx="0" cy="0" fill="var(--lime)" />
          <circle className="i-ring" r="11" cx="0" cy="0" fill="none" stroke="var(--lime)" strokeWidth="1.5" opacity=".6" />
        </g>
      )}
      {id === 'sound' && (
        <g>
          {[16, 28, 40, 52, 64].map((x, i) => (
            <rect key={x} className="i-eq" x={x} y="22" width="10" height="52" rx="5" fill={i % 2 ? 'var(--violet)' : 'var(--blue)'} />
          ))}
          <path className="i-arc" d="M80 36c5 7 5 17 0 24" {...stroke} stroke="var(--lime)" />
          <path className="i-arc" d="M87 28c9 11 9 29 0 40" {...stroke} stroke="var(--lime)" />
        </g>
      )}
      {id === 'video' && (
        <g>
          <rect x="10" y="18" width="76" height="52" rx="10" {...stroke} />
          <polygon className="i-play" points="41,31 41,57 62,44" fill="var(--lime)" />
          <path d="M10 82h76" {...stroke} opacity=".3" />
          <rect className="i-prog" x="10" y="80" width="76" height="4" rx="2" fill="var(--violet)" />
        </g>
      )}
      {id === 'ai' && (
        <g>
          <path
            className="i-star"
            d="M46 12C49 34 58 43 80 47C58 51 49 60 46 82C43 60 34 51 12 47C34 43 43 34 46 12Z"
            fill="none"
            stroke="var(--violet)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path className="i-spark" d="M78 12c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10z" fill="var(--lime)" />
          <path className="i-spark" d="M20 66c1 5 2 6 7 7-5 1-6 2-7 7-1-5-2-6-7-7 5-1 6-2 7-7z" fill="var(--blue)" />
          <circle className="i-core" cx="46" cy="47" r="5" fill="#fff" />
        </g>
      )}
    </svg>
  )
}

/** Бесконечная анимация иконки. Вызывать внутри gsap.context, чтобы она откатывалась при размонтировании. */
export function animateIcon(svg: Element, id: SkillId): gsap.core.Timeline {
  const q = (s: string) => Array.from(svg.querySelectorAll(s))
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 })
  switch (id) {
    case 'site':
      tl.fromTo(q('.i-bar'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.6, stagger: 0.18, ease: 'power3.out' })
        .fromTo(q('.i-dot'), { scale: 0.4, transformOrigin: '50% 50%' }, { scale: 1.2, duration: 0.3, stagger: 0.08, yoyo: true, repeat: 1 }, 0)
        .fromTo(q('.i-cursor'), { x: -22, y: -18, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.2)
        .to(q('.i-cursor'), { x: 6, y: 8, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' })
        .to(q('.i-bar'), { opacity: 0.25, duration: 0.4 }, '+=0.4')
        .to(q('.i-bar'), { opacity: 1, duration: 0.1 })
      break
    case 'motion': {
      const path = svg.querySelector('.i-curve') as SVGPathElement
      gsap.set(q('.i-ball, .i-ring'), { xPercent: 0 })
      tl.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut' }, 0)
        .to(q('.i-ball, .i-ring'), { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 1.4, ease: 'power2.inOut' }, 0)
        .to(q('.i-ring'), { scale: 1.5, opacity: 0, transformOrigin: '50% 50%', duration: 0.5, repeat: 1, yoyo: true }, 1.4)
        .to(path, { drawSVG: '100% 100%', duration: 0.6, ease: 'power2.in' }, '+=0.2')
      break
    }
    case 'sound':
      q('.i-eq').forEach((b, i) => {
        tl.to(b, { scaleY: gsap.utils.random(0.25, 0.55), transformOrigin: '50% 50%', duration: 0.35 + i * 0.07, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0)
      })
      tl.fromTo(q('.i-arc'), { opacity: 0.2 }, { opacity: 1, duration: 0.3, stagger: 0.15, yoyo: true, repeat: 3 }, 0)
      break
    case 'video':
      tl.fromTo(q('.i-prog'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 2, ease: 'none' }, 0)
        .to(q('.i-play'), { scale: 1.25, transformOrigin: '45% 50%', duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0)
      break
    case 'ai':
      tl.to(q('.i-star'), { rotation: 90, transformOrigin: '50% 50%', duration: 2.2, ease: 'power2.inOut' }, 0)
        .fromTo(q('.i-spark'), { scale: 0.2, transformOrigin: '50% 50%', opacity: 0.4 }, { scale: 1.2, opacity: 1, duration: 0.7, stagger: 0.35, yoyo: true, repeat: 2, ease: 'sine.inOut' }, 0)
        .to(q('.i-core'), { scale: 1.8, transformOrigin: '50% 50%', duration: 0.5, yoyo: true, repeat: 3 }, 0)
      break
  }
  return tl
}
