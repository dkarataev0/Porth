import { useRef, type ReactNode, type ElementType, type ComponentPropsWithoutRef } from 'react'
import { gsap, isTouch, prefersReduced, useGSAP } from '../lib/motion'

type Props<T extends ElementType> = {
  as?: T
  strength?: number
  children: ReactNode
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

/** Кнопка, которая притягивается к курсору. На тач-устройствах и при reduced-motion ничего не делает. */
export function Magnetic<T extends ElementType = 'button'>({ as, strength = 0.35, children, className = '', ...rest }: Props<T>) {
  const Tag = (as || 'button') as ElementType
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || isTouch() || prefersReduced()) return
      const inner = el.querySelector<HTMLElement>('.mag-in')
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' })
      const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.5, ease: 'power3.out' }) : null
      const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.5, ease: 'power3.out' }) : null
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        xTo(dx * strength)
        yTo(dy * strength)
        ixTo?.(dx * strength * 0.5)
        iyTo?.(dy * strength * 0.5)
      }
      const leave = () => {
        xTo(0)
        yTo(0)
        ixTo?.(0)
        iyTo?.(0)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={`mag ${className}`} {...rest}>
      <span className="mag-in">{children}</span>
    </Tag>
  )
}
