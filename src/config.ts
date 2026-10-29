// TODO: замените на свои контакты. Всё остальное на сайте подтягивается отсюда.
export const CONTACTS = {
  telegram: { href: 'https://t.me/your_username', label: '@your_username' },
  whatsapp: { href: 'https://wa.me/70000000000', label: '+7 000 000-00-00' },
  email: { href: 'mailto:hello@example.com', label: 'hello@example.com' },
}

// Если указать адрес (Formspree, свой бэкенд), форма будет отправлять JSON методом POST.
// Если пусто — форма откроет письмо в почтовой программе с уже заполненным текстом.
export const FORM_ENDPOINT = ''

export const OWNER = 'Даниил Каратаев'
export const INTRO_FLAG = 'porth.intro.seen.v1'
