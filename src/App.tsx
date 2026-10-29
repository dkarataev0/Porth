import { lazy, Suspense, useState } from 'react'
import { Intro } from './intro/Intro'
import { SoundButton } from './components/SoundButton'
import { Cursor } from './components/Cursor'
import { prefersReduced } from './lib/motion'
import { INTRO_FLAG } from './config'

const loadSite = () => import('./site/Site')
const Site = lazy(loadSite)

function shouldPlayIntro() {
  if (prefersReduced()) return false
  try {
    return localStorage.getItem(INTRO_FLAG) !== '1'
  } catch {
    return true
  }
}

export default function App() {
  const [introOn, setIntroOn] = useState(shouldPlayIntro)
  const [siteMounted, setSiteMounted] = useState(!introOn)
  const [replayKey, setReplayKey] = useState(0)

  // Пока показывается стартовый экран, подгружаем сайт в фоне.
  if (introOn && !siteMounted) void loadSite()

  return (
    <>
      <SoundButton />
      <Cursor />
      {siteMounted && (
        <Suspense fallback={null}>
          <Site onReplay={() => { setReplayKey((k) => k + 1); setIntroOn(true) }} canReplay={!prefersReduced()} />
        </Suspense>
      )}
      {introOn && <Intro key={replayKey} onReveal={() => setSiteMounted(true)} onClose={() => setIntroOn(false)} />}
    </>
  )
}
