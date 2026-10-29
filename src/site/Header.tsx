import { useEffect, useState } from 'react'
import { Magnetic } from '../components/Magnetic'
import { scrollToTarget } from '../lib/lenis'

const NAV = [
  { href: '#services', label: 'Услуги' },
  { href: '#works', label: 'Работы' },
  { href: '#process', label: 'Процесс' },
  { href: '#contacts', label: 'Контакты' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToTarget(href)
  }

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <a href="#top" className="logo" onClick={go('#top')} aria-label="Даниил Каратаев — наверх">
        <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2d5bff" />
              <stop offset=".6" stopColor="#a24bff" />
              <stop offset="1" stopColor="#c6ff1a" />
            </linearGradient>
          </defs>
          <path d="M18 14h14c11 0 18 8 18 18s-7 18-18 18H18z" fill="none" stroke="url(#lg)" strokeWidth="7" strokeLinejoin="round" />
        </svg>
        <span>Даниил Каратаев</span>
      </a>
      <nav className="nav" aria-label="Разделы сайта">
        {NAV.map((n) => (
          <a key={n.href} href={n.href} onClick={go(n.href)}>
            {n.label}
          </a>
        ))}
      </nav>
      <Magnetic as="a" href="#contacts" className="btn btn-lime btn-sm header-cta" onClick={go('#contacts')}>
        Написать
      </Magnetic>
      <button type="button" className="burger" aria-expanded={open} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setOpen((o) => !o)}>
        <span />
        <span />
      </button>
      <div className="mobile-menu" aria-hidden={!open}>
        {NAV.map((n) => (
          <a key={n.href} href={n.href} onClick={go(n.href)} tabIndex={open ? 0 : -1}>
            {n.label}
          </a>
        ))}
      </div>
    </header>
  )
}
