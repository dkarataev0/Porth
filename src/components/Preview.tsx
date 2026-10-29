import { useRef } from 'react'
import { gsap } from '../lib/motion'
import type { Project } from '../data'

interface Props {
  project: Project
  className?: string
  flipId?: string
  eager?: boolean
}

/** Превью проекта: при наведении длинный скриншот сайта «скроллится» внутри рамки. */
export function Preview({ project, className = '', flipId, eager }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)

  const scrollTo = (down: boolean) => {
    const b = box.current
    const i = img.current
    if (!b || !i) return
    const max = Math.max(0, i.offsetHeight - b.offsetHeight)
    if (!max) return
    gsap.killTweensOf(i)
    if (down) gsap.to(i, { y: -max, duration: Math.min(14, max / 240), ease: 'none' })
    else gsap.to(i, { y: 0, duration: 0.9, ease: 'power3.out' })
  }

  return (
    <div
      ref={box}
      className={`pv ${className}`}
      data-flip-id={flipId}
      onPointerEnter={(e) => e.pointerType === 'mouse' && scrollTo(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && scrollTo(false)}
    >
      <img
        ref={img}
        src={project.img}
        width={project.imgW}
        height={project.imgH}
        alt={`Превью сайта: ${project.title}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
      <span className="pv-sheen" aria-hidden="true" />
    </div>
  )
}
