import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { sound } from '../audio/sound'
import { INTRO_FLAG } from '../config'
import { resumeLenis, scrollToTarget, stopLenis } from '../lib/lenis'
import { Magnetic } from '../components/Magnetic'

const loadShow = () => import('./IntroShow')
const IntroShow = lazy(loadShow)

interface Props {
  onReveal: () => void
  onClose: () => void
}

/** Оверлей интро: стартовый экран (клик нужен для звука), сцены и «шторки», которые открывают сайт. */
export function Intro({ onReveal, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'gate' | 'show'>('gate')
  const closing = useRef(false)

  useEffect(() => {
    document.documentElement.classList.add('intro-lock')
    stopLenis()
    window.scrollTo(0, 0)
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 400))
    idle(() => void loadShow())
    return () => {
      document.documentElement.classList.remove('intro-lock')
    }
  }, [])

  const finish = useCallback(
    (goContact = false) => {
      if (closing.current || !root.current) return
      closing.current = true
      sound.stopVoice()
      try {
        localStorage.setItem(INTRO_FLAG, '1')
      } catch {
        /* приватный режим — не критично */
      }
      onReveal()
      const el = root.current
      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.classList.remove('intro-lock')
          resumeLenis()
          onClose()
          if (goContact) window.setTimeout(() => scrollToTarget('#contacts'), 80)
        },
      })
      tl.call(() => sound.whoosh(false), [], 0)
        .to(el.querySelectorAll('.intro-content, .gate'), { opacity: 0, scale: 0.9, duration: 0.55, ease: 'power3.in' }, 0)
        .to(el.querySelectorAll('.strip'), { scaleY: 0, duration: 1.0, ease: 'expo.inOut', stagger: { each: 0.08, from: 'edges' } }, 0.3)
    },
    [onClose, onReveal],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish])

  const start = (withSound: boolean) => {
    if (withSound) void sound.enable()
    else sound.disable()
    setPhase('show')
  }

  return (
    <div ref={root} className="intro" role="dialog" aria-modal="true" aria-label="Вступительное шоу">
      <div className="strips" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="strip" />
        ))}
      </div>
      {phase === 'gate' ? (
        <div className="gate">
          <p className="gate-brand">Даниил Каратаев</p>
          <button type="button" className="skip-btn gate-skip" onClick={() => finish()}>
            Пропустить
          </button>
          <div className="gate-center">
            <Magnetic as="button" type="button" className="gate-start" onClick={() => start(true)} strength={0.25}>
              <span className="gate-pulse" aria-hidden="true" />
              <span className="gate-pulse p2" aria-hidden="true" />
              <span className="gate-label">Включить звук и начать</span>
            </Magnetic>
            <button type="button" className="gate-mute" onClick={() => start(false)}>
              Без звука
            </button>
            <p className="gate-hint">Со звуком: голос, музыка и эффекты. Выключить можно в любой момент.</p>
          </div>
        </div>
      ) : (
        <Suspense fallback={null}>
          <IntroShow onFinish={finish} />
        </Suspense>
      )}
    </div>
  )
}
