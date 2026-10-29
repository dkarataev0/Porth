import { sound, useSound } from '../audio/sound'

/** Кнопка mute: всегда видна поверх всего, включая интро. */
export function SoundButton() {
  const { on } = useSound()
  return (
    <button
      type="button"
      className={`sound-btn${on ? ' is-on' : ''}`}
      onClick={() => sound.toggle()}
      aria-pressed={on}
      aria-label={on ? 'Выключить звук' : 'Включить звук'}
      data-cursor={on ? 'Выкл. звук' : 'Вкл. звук'}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" fillOpacity=".15" />
        {on ? (
          <>
            <path className="snd-w1" d="M15.5 9.2a4 4 0 010 5.6" />
            <path className="snd-w2" d="M18.2 6.8a7.6 7.6 0 010 10.4" />
          </>
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </svg>
      <span className="sound-btn-text">{on ? 'Звук' : 'Без звука'}</span>
    </button>
  )
}
