import { fetchDom, parseStartEnd, sanitizeHtml } from '../../utility'
import { crawler } from '../../context'

export const run = crawler(async () => {
  const events_link = `https://www.thersa.org/events/`
  const d = await fetchDom(events_link)
  const c = Array.from(d.document.querySelectorAll('main section:nth-of-type(1) .cards__items article')).map((x) => ({
    link: x.querySelector('a')?.getAttribute('href'),
    image: x.querySelector('img')?.getAttribute('src'),
  }))

  const lectures = await Promise.all(
    c.map(async (x) => {
      if (!x.link) return null
      const w = await fetchDom(x.link)
      const time = w.document.querySelector('header .date-time')?.textContent
      return {
        free: true,
        link: x.link,
        title: w.document.querySelector('h1')?.textContent,
        location: w.document.querySelector('.page-header__location')?.textContent.trim(),
        summary: w.document.querySelector('.aside__inner .column')?.textContent.trim(),
        summary_html: sanitizeHtml(w.document.querySelector('.aside__inner .column')?.innerHTML),
        ...parseStartEnd(time || ''),
      }
    }),
  )

  return {
    name: 'RSA',
    website: 'https://www.thersa.org',
    twitter: '@thersaorg',
    lectures: lectures.filter(Boolean),
  }
})
