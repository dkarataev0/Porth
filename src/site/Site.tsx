import { useEffect } from 'react'
import { ScrollTrigger } from '../lib/motion'
import { startLenis, stopLenis, scrollToTarget } from '../lib/lenis'
import { Header } from './Header'
import { Hero } from './Hero'
import { Services } from './Services'
import { Portfolio } from './Portfolio'
import { Process } from './Process'
import { Contacts } from './Contacts'

export default function Site({ onReplay, canReplay }: { onReplay: () => void; canReplay: boolean }) {
  useEffect(() => {
    startLenis()
    if (document.documentElement.classList.contains('intro-lock')) stopLenis()
    document.fonts.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Process />
        <Contacts />
      </main>
      <footer className="footer">
        <p>© 2026 Даниил Каратаев</p>
        <div className="footer-links">
          {canReplay && (
            <button type="button" className="link-btn" onClick={() => (scrollToTarget(0, true), onReplay())}>
              Посмотреть интро снова
            </button>
          )}
          <button type="button" className="link-btn" onClick={() => scrollToTarget('#top')}>
            Наверх
          </button>
        </div>
      </footer>
    </>
  )
}
