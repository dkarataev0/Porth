#!/usr/bin/env node
/**
 * Генерирует озвучку сцен интро через ElevenLabs (модель eleven_multilingual_v2, русский язык)
 * и пишет mp3 + manifest.json в public/voice. Сайт сам подхватывает эти файлы;
 * если их нет — использует Web Speech API как запасной вариант.
 *
 *   ELEVENLABS_API_KEY=... npm run voice
 *
 * Необязательно:
 *   ELEVENLABS_VOICE_ID — id голоса (по умолчанию George, тёплый мужской голос; смените на любой из вашей библиотеки)
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const key = process.env.ELEVENLABS_API_KEY
if (!key) {
  console.error('ELEVENLABS_API_KEY не задан. Без него сайт использует голос браузера (Web Speech API).')
  process.exit(1)
}

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb'
const MODEL = 'eleven_multilingual_v2'

// Тексты должны совпадать с константами *_TEXT в src/intro/*.tsx
const SCENES = {
  scene1: 'Привет! Меня зовут Даниил Каратаев. Я превращаю идеи в сайты, которые запоминаются.',
  scene2:
    'Вот что я умею. Лендинги и сайты под ключ. Анимации и motion-дизайн. Сайты с озвучкой и интерактивом. Промо-видео. И ИИ-интеграции.',
  scene3:
    'Вот что мы уже сделали. Сайт зип-систем Алютек в Краснодаре. Шоколад, который не описать пером. И сайт, который вы сейчас смотрите.',
  scene4: 'Давайте создадим ваш проект.',
}

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'voice')
await mkdir(out, { recursive: true })

function duration(file, bytes) {
  try {
    return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString())
  } catch {
    return (bytes * 8) / 128000 // mp3 128 kbps
  }
}

const keys = Object.keys(SCENES)
const manifest = {}
for (let i = 0; i < keys.length; i++) {
  const id = keys[i]
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text: SCENES[id],
      model_id: MODEL,
      // сохраняем интонацию между сценами
      previous_text: i > 0 ? SCENES[keys[i - 1]] : undefined,
      next_text: i < keys.length - 1 ? SCENES[keys[i + 1]] : undefined,
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
    }),
  })
  if (!res.ok) {
    console.error(`${id}: ошибка ${res.status} ${await res.text()}`)
    process.exit(1)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const file = join(out, `${id}.mp3`)
  await writeFile(file, buf)
  manifest[id] = { file: `${id}.mp3`, duration: Number(duration(file, buf.length).toFixed(2)) }
  console.log(`✓ ${id}.mp3 — ${manifest[id].duration} с`)
}
await writeFile(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log('Готово: public/voice/manifest.json')
