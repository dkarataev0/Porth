import { useEffect, useState } from 'react'
import { PROJECTS } from '../data'
import { Greeting } from './Greeting'
import { Skills } from './Skills'
import { Works } from './Works'
import { Finale } from './Finale'

const SCENES = 4

/** Сценарий интро: 4 сцены подряд, каждая живёт ровно столько, сколько звучит её реплика. */
export default function IntroShow({ onFinish }: { onFinish: (goContact?: boolean) => void }) {
  const [scene, setScene] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    PROJECTS.forEach((p) => {
      const i = new Image()
      i.src = p.img
    })
    const loads = [
      document.fonts.load('800 64px "Unbounded Variable"', 'Даниил Каратаев'),
      document.fonts.load('500 16px "Manrope Variable"', 'Привет'),
    ]
    Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 1500))]).then(() => setReady(true))
  }, [])

  const next = () => setScene((s) => s + 1)

  return (
    <div className="intro-content">
      <div className="intro-ambience" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="grid-floor" />
      </div>
      <div className="intro-hud">
        <div className="intro-progress" aria-hidden="true">
          {Array.from({ length: SCENES }, (_, i) => (
            <span key={i} className={i < scene ? 'done' : i === scene ? 'active' : ''}>
              <i />
            </span>
          ))}
        </div>
        <button type="button" className="skip-btn" onClick={() => onFinish()} data-cursor="Пропустить">
          Пропустить
        </button>
      </div>
      {ready && scene === 0 && <Greeting onDone={next} />}
      {ready && scene === 1 && <Skills onDone={next} />}
      {ready && scene === 2 && <Works onDone={next} />}
      {ready && scene === 3 && <Finale onDone={() => onFinish()} onContact={() => onFinish(true)} />}
    </div>
  )
}
