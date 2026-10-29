import { useRef, useState } from 'react'
import { gsap, SplitText, prefersReduced, useGSAP } from '../lib/motion'
import { Magnetic } from '../components/Magnetic'
import { CONTACTS, FORM_ENDPOINT, OWNER } from '../config'

type Status = 'idle' | 'sending' | 'done' | 'error'

const ICONS = {
  telegram: 'M21.5 4.5L2.9 11.7c-.9.4-.9 1.2-.2 1.4l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.4-2.3 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.5-1.5z',
  whatsapp: 'M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm4.6 12.3c-.2.6-1.2 1.1-1.7 1.1-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.7 1.2 1.5 1.8 1 .9 1.900 1.200 2.200 1.300.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.900.9c.3.100.4.200.5.300.1.300.1.800-.2 1.200z',
  email: 'M3 6.5A1.5 1.500 0 014.500 5h15A1.500 1.500 0 0121 6.500v11a1.500 1.500 0 01-1.500 1.500h-15A1.500 1.500 0 013 17.500zm1.800.4l7.200 5.200 7.200-5.200',
}

export function Contacts() {
  const root = useRef<HTMLElement>(null)
  const [status, setStatus] = useState<Status>('idle')

  useGSAP(
    () => {
      const reduce = prefersReduced()
      const head = SplitText.create('.contacts-title', { type: 'words', mask: 'words', aria: 'none' })
      gsap.from(head.words, { yPercent: 110, duration: 1.1, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: '.contacts-title', start: 'top 85%' } })
      gsap.from('.clink, .cform', { y: reduce ? 0 : 50, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.contacts-grid', start: 'top 82%' } })
    },
    { scope: root },
  )

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = e.currentTarget
    const data = Object.fromEntries(new FormData(f)) as Record<string, string>
    setStatus('sending')
    try {
      if (FORM_ENDPOINT) {
        const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        if (!r.ok) throw new Error(String(r.status))
      } else {
        const to = CONTACTS.email.href.replace('mailto:', '')
        const subject = encodeURIComponent(`Заявка с сайта от ${data.name}`)
        const body = encodeURIComponent(`Имя: ${data.name}\nКак связаться: ${data.contact}\n\n${data.message}`)
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
      }
      setStatus('done')
      f.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section ref={root} id="contacts" className="contacts">
      <div className="contacts-bg" aria-hidden="true" />
      <h2 className="h2 contacts-title">Давайте создадим ваш проект</h2>
      <div className="contacts-grid">
        <div className="clinks">
          {(['telegram', 'whatsapp', 'email'] as const).map((k) => (
            <Magnetic key={k} as="a" href={CONTACTS[k].href} target={k === 'email' ? undefined : '_blank'} rel="noopener noreferrer" className="clink" strength={0.18} data-cursor="Написать">
              <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill={k === 'email' ? 'none' : 'currentColor'} stroke={k === 'email' ? 'currentColor' : 'none'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={ICONS[k]} />
              </svg>
              <span className="clink-text">
                <span className="clink-name">{k === 'telegram' ? 'Telegram' : k === 'whatsapp' ? 'WhatsApp' : 'E-mail'}</span>
                <span className="clink-val">{CONTACTS[k].label}</span>
              </span>
            </Magnetic>
          ))}
        </div>
        <form className="cform" onSubmit={submit} noValidate={false}>
          <label>
            <span>Как вас зовут</span>
            <input name="name" type="text" required autoComplete="name" placeholder="Анна" />
          </label>
          <label>
            <span>Как с вами связаться</span>
            <input name="contact" type="text" required autoComplete="email" placeholder="Telegram, телефон или e-mail" />
          </label>
          <label>
            <span>О проекте</span>
            <textarea name="message" rows={4} required placeholder="Что нужно сделать и к какому сроку" />
          </label>
          <Magnetic as="button" type="submit" className="btn btn-lime cform-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Отправляю…' : 'Отправить заявку'}
          </Magnetic>
          <p className="cform-status" role="status" aria-live="polite">
            {status === 'done' && (FORM_ENDPOINT ? 'Спасибо! Заявка отправлена, отвечу в ближайшее время.' : 'Открыл письмо в вашей почте. Нажмите «Отправить», и заявка у меня.')}
            {status === 'error' && 'Не получилось отправить. Напишите в Telegram или на почту.'}
          </p>
        </form>
      </div>
      <p className="visually-hidden">{OWNER}</p>
    </section>
  )
}
