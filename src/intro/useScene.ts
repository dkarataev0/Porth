import { useEffect, useRef, type RefObject } from 'react'
import { gsap } from '../lib/motion'
import { sound } from '../audio/sound'

export interface SceneCtx {
  root: HTMLElement
  /** Основной таймлайн сцены: позиции в секундах от начала реплики. */
  tl: gsap.core.Timeline
  /** Длительность озвучки сцены (реальная у mp3, оценочная у речи браузера). */
  D: number
  /** Момент (сек), когда в тексте реплики начинается указанная фраза. */
  at: (phrase: string) => number
}

interface Opts {
  scope: RefObject<HTMLElement | null>
  voiceKey: string
  text: string
  /** Длительность, если звука нет («Без звука»). */
  nominal: number
  build: (c: SceneCtx) => void
  exit: (tl: gsap.core.Timeline, root: HTMLElement) => void
  onDone: () => void
}

/**
 * Запускает озвучку сцены и привязывает таймлайн GSAP к её длительности:
 * сцена идёт ровно столько, сколько звучит голос, затем играет exit и сообщает о завершении.
 */
export function useScene(opts: Opts) {
  const ref = useRef(opts)
  ref.current = opts

  useEffect(() => {
    const o = ref.current
    const root = o.scope.current
    if (!root) return
    let cancelled = false
    let ctx: gsap.Context | null = null
    let voice: Awaited<ReturnType<typeof sound.speak>> | null = null

    void (async () => {
      voice = await sound.speak(o.voiceKey, o.text, o.nominal)
      if (cancelled) {
        voice.stop()
        return
      }
      const v = voice
      const D = Math.max(v.duration, 1.5)
      const at = (phrase: string) => {
        const i = o.text.indexOf(phrase)
        return i < 0 ? 0 : (i / o.text.length) * D
      }
      ctx = gsap.context(() => {
        const tl = gsap.timeline()
        const exit = gsap.timeline({ paused: true })
        sound.whoosh()
        o.build({ root, tl, D, at })
        if (tl.duration() < D) tl.set({}, {}, D)
        o.exit(exit, root)
        const mainDone = new Promise<void>((r) => tl.eventCallback('onComplete', () => r()))
        void Promise.all([mainDone, v.done]).then(() => {
          if (cancelled) return
          exit.eventCallback('onComplete', () => !cancelled && ref.current.onDone())
          exit.play()
        })
      }, root)
    })()

    return () => {
      cancelled = true
      voice?.stop()
      ctx?.revert()
    }
  }, [])
}

/** «Караоке»-субтитры: слова подсвечиваются синхронно с голосом. */
export function karaoke(tl: gsap.core.Timeline, words: Element[], D: number, start = 0) {
  tl.fromTo(
    words,
    { opacity: 0.28 },
    { opacity: 1, duration: 0.18, stagger: { each: Math.max(0.05, (D * 0.92) / Math.max(1, words.length)) }, ease: 'none' },
    start,
  )
}
