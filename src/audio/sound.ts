import { useSyncExternalStore } from 'react'

export interface Voice {
  /** Длительность реплики в секундах (реальная у mp3, оценочная у речи браузера). */
  duration: number
  /** Резолвится, когда реплика закончилась (или сработал таймаут). */
  done: Promise<void>
  stop: () => void
}

interface ManifestEntry {
  file: string
  duration: number
}

const MUSIC_LEVEL = 0.15
const MUSIC_DUCKED = 0.085

class Sound {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private music!: GainNode
  private sfx!: GainNode
  private noise!: AudioBuffer
  private chordTimer = 0
  private voiceEl: HTMLAudioElement | null = null
  private voiceStop: (() => void) | null = null
  private manifest: Record<string, ManifestEntry> | null | undefined
  private listeners = new Set<() => void>()

  enabled = false
  muted = false
  snapshot = { on: false }

  subscribe = (cb: () => void) => {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }
  getSnapshot = () => this.snapshot
  private emit() {
    this.snapshot = { on: this.enabled && !this.muted }
    this.listeners.forEach((l) => l())
  }

  /** Вызывать только из пользовательского жеста (клик/тап) — иначе браузер заблокирует звук. */
  async enable() {
    this.enabled = true
    this.muted = false
    if (!this.ctx) this.build()
    try {
      await this.ctx!.resume()
    } catch {
      /* ignore */
    }
    this.master.gain.setTargetAtTime(1, this.ctx!.currentTime, 0.05)
    this.emit()
  }

  disable() {
    this.enabled = false
    this.stopVoice()
    this.master?.gain.setTargetAtTime(0, this.ctx?.currentTime ?? 0, 0.05)
    this.emit()
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.05)
    if (this.voiceEl) this.voiceEl.muted = m
    if (m && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    this.emit()
  }

  toggle() {
    if (!this.enabled) void this.enable()
    else this.setMuted(!this.muted)
  }

  private build() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(ctx.destination)
    this.music = ctx.createGain()
    this.music.gain.value = MUSIC_LEVEL
    this.music.connect(this.master)
    this.sfx = ctx.createGain()
    this.sfx.gain.value = 0.55
    this.sfx.connect(this.master)

    const len = ctx.sampleRate * 1.5
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = this.noise.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1

    this.startAmbient()
  }

  /** Тихий эмбиент: мягкий пэд на прогрессии Am – F – C – G, всё синтезируется на лету. */
  private startAmbient() {
    const ctx = this.ctx!
    const chords = [
      [110, 164.81, 220, 261.63, 329.63],
      [87.31, 130.81, 174.61, 261.63, 349.23],
      [130.81, 196, 261.63, 329.63, 392],
      [98, 146.83, 196, 293.66, 392],
    ]
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 780
    filter.Q.value = 0.6
    filter.connect(this.music)

    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.07
    lfoGain.gain.value = 320
    lfo.connect(lfoGain).connect(filter.frequency)
    lfo.start()

    const voices: OscillatorNode[] = []
    chords[0].forEach((f, i) => {
      for (const detune of [-7, 7]) {
        const o = ctx.createOscillator()
        o.type = i < 2 ? 'sawtooth' : 'triangle'
        o.frequency.value = f
        o.detune.value = detune
        const g = ctx.createGain()
        g.gain.value = i < 2 ? 0.05 : 0.04
        o.connect(g).connect(filter)
        o.start()
        voices.push(o)
      }
    })

    const sub = ctx.createOscillator()
    const subGain = ctx.createGain()
    sub.type = 'sine'
    sub.frequency.value = 55
    subGain.gain.value = 0.12
    sub.connect(subGain).connect(this.music)
    sub.start()
    const pulse = ctx.createOscillator()
    const pulseGain = ctx.createGain()
    pulse.frequency.value = 0.45
    pulseGain.gain.value = 0.07
    pulse.connect(pulseGain).connect(subGain.gain)
    pulse.start()

    let step = 0
    const bass = [55, 43.65, 65.41, 49]
    const next = () => {
      step = (step + 1) % chords.length
      const now = ctx.currentTime
      voices.forEach((o, idx) => o.frequency.setTargetAtTime(chords[step][Math.floor(idx / 2)], now, 1.6))
      sub.frequency.setTargetAtTime(bass[step], now, 1.2)
    }
    this.chordTimer = window.setInterval(next, 8000)
  }

  private duck(on: boolean) {
    if (!this.ctx) return
    this.music.gain.setTargetAtTime(on ? MUSIC_DUCKED : MUSIC_LEVEL, this.ctx.currentTime, 0.25)
  }

  whoosh(up = true) {
    if (!this.ctx || !this.enabled) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.4
    bp.frequency.setValueAtTime(up ? 280 : 3200, t)
    bp.frequency.exponentialRampToValueAtTime(up ? 3200 : 280, t + 0.65)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.22)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75)
    src.connect(bp).connect(g).connect(this.sfx)
    src.start(t)
    src.stop(t + 0.8)
  }

  hit(freq = 660) {
    if (!this.ctx || !this.enabled) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, t)
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.25)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    o.connect(g).connect(this.sfx)
    o.start(t)
    o.stop(t + 0.32)
  }

  stopVoice() {
    this.voiceStop?.()
    this.voiceStop = null
  }

  private async loadManifest() {
    if (this.manifest !== undefined) return this.manifest
    try {
      const r = await fetch('/voice/manifest.json', { cache: 'no-cache' })
      const type = r.headers.get('content-type') || ''
      this.manifest = r.ok && type.includes('json') ? await r.json() : null
    } catch {
      this.manifest = null
    }
    return this.manifest
  }

  /**
   * Озвучивает реплику сцены.
   * 1) если в /public/voice есть mp3 от ElevenLabs — играем его;
   * 2) иначе — Web Speech API (ru-RU);
   * 3) если звук выключен («Без звука») — просто возвращаем номинальную длительность.
   */
  async speak(key: string, text: string, nominal: number): Promise<Voice> {
    this.stopVoice()
    if (!this.enabled) return { duration: nominal, done: Promise.resolve(), stop() {} }

    const manifest = await this.loadManifest()
    const entry = manifest?.[key]
    if (entry) {
      const v = await this.playFile(entry)
      if (v) return v
    }
    return this.speakSynth(text, nominal)
  }

  private playFile(entry: ManifestEntry): Promise<Voice | null> {
    return new Promise((resolve) => {
      const a = new Audio(`/voice/${entry.file}`)
      a.preload = 'auto'
      a.muted = this.muted
      let settled = false
      const fail = () => {
        if (!settled) {
          settled = true
          resolve(null)
        }
      }
      a.addEventListener('error', fail, { once: true })
      a.addEventListener(
        'loadedmetadata',
        () => {
          if (settled) return
          settled = true
          const duration = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : entry.duration
          let finish!: () => void
          const done = new Promise<void>((r) => (finish = r))
          this.voiceEl = a
          this.duck(true)
          const end = () => {
            this.duck(false)
            if (this.voiceEl === a) this.voiceEl = null
            finish()
          }
          a.addEventListener('ended', end, { once: true })
          const stop = () => {
            a.pause()
            end()
          }
          this.voiceStop = stop
          a.play().catch(() => stop())
          resolve({ duration, done, stop })
        },
        { once: true },
      )
      window.setTimeout(fail, 2500)
    })
  }

  private async pickVoice(): Promise<SpeechSynthesisVoice | undefined> {
    const synth = window.speechSynthesis
    let voices = synth.getVoices()
    if (!voices.length) {
      await new Promise<void>((r) => {
        const t = window.setTimeout(r, 400)
        synth.addEventListener('voiceschanged', () => (clearTimeout(t), r()), { once: true })
      })
      voices = synth.getVoices()
    }
    const ru = voices.filter((v) => v.lang.toLowerCase().startsWith('ru'))
    return ru.find((v) => /pavel|yuri|dmitri|dmitry|maxim|male|муж/i.test(v.name)) || ru[0]
  }

  private async speakSynth(text: string, nominal: number): Promise<Voice> {
    // Скорость русской речи ≈ 14 символов в секунду.
    const estimate = Math.max(nominal * 0.6, text.length / 14)
    let finish!: () => void
    const done = new Promise<void>((r) => (finish = r))
    let ended = false
    const end = () => {
      if (ended) return
      ended = true
      this.duck(false)
      finish()
    }
    const hasSynth = 'speechSynthesis' in window
    if (!hasSynth) {
      window.setTimeout(end, estimate * 1000)
      return { duration: estimate, done, stop: end }
    }
    const synth = window.speechSynthesis
    synth.cancel()
    const voice = await this.pickVoice()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ru-RU'
    u.rate = 1.02
    u.pitch = 0.85
    if (voice) u.voice = voice
    u.volume = this.muted ? 0 : 1
    const guard = window.setTimeout(end, estimate * 1000 * 1.7 + 1500)
    u.onend = () => {
      clearTimeout(guard)
      // Если озвучку отменили из-за mute, ждём оставшееся расчётное время.
      end()
    }
    u.onerror = () => {
      clearTimeout(guard)
      window.setTimeout(end, estimate * 1000)
    }
    this.duck(true)
    if (!this.muted) synth.speak(u)
    else window.setTimeout(end, estimate * 1000)
    const stop = () => {
      clearTimeout(guard)
      synth.cancel()
      end()
    }
    this.voiceStop = stop
    return { duration: estimate, done, stop }
  }

  destroy() {
    clearInterval(this.chordTimer)
  }
}

export const sound = new Sound()

export function useSound() {
  return useSyncExternalStore(sound.subscribe, sound.getSnapshot)
}
