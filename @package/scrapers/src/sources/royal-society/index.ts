import { fetchDom, parseStartEnd, sanitizeHtml } from '../../utility'
import { Host, Lecture } from '../../entities'
import { crawler } from '../../context'

const info: Omit<Host, 'lectures'> = {
  name: 'The Royal Society',
  website: 'https://royalsociety.org',
  icon: 'https://royalsociety.org/assets/icons/favicon-16x16.png',
  description: `The Royal Society is a Fellowship of many of the world's most eminent scientists and is the oldest scientific academy in continuous existence.`,
  twitter: '@royalsociety',
  threads: '@theroyalsociety',
}

export const run = crawler(async () => {
  const dom = await fetchDom(`${info.website}/science-events-and-lectures/public/`)
  const events = Array.from(dom.document.querySelectorAll('.post-display__content article'))
  const lectures = await Promise.all(
    events.map(async (event): Promise<Lecture | null> => {
      const href = event.querySelector('a')!.href
      const link = `${info.website}${href}`
      const page = await fetchDom(link)

      const date = page.document.querySelector('.blog-header__meta.blog-header__date')?.textContent?.trim()
      const time = page.document.querySelector('.blog-header__meta.blog-header__time')?.textContent?.trim()
      const location = page.document.querySelector('.blog-header__meta.blog-header__location')?.textContent?.trim()
      if (!time || !location || /liverpool/gim.test(location)) return null

      const image_elem = page.document.querySelector('.blog__event-image-main')
      const image_src = image_elem?.getAttribute('src') || image_elem?.getAttribute('data-src')
      const image = image_src ? { src: `${info.website}${image_src}` } : undefined

      const title = page.document.querySelector('h1')?.textContent?.trim()!
      const summary_elems = Array.from(page.document.querySelectorAll('.blog__content p'))
      const summary = summary_elems.map((x) => x.textContent?.trim()).join('\n')!
      const summary_html = sanitizeHtml(summary_elems.map((x) => x.outerHTML).join('\n'))!
      const times = parseStartEnd(`${date}, ${time}`)
      const free = !!page.document.querySelector('.blog-header__metas')?.textContent?.trim().includes('Free')
      return { ...times, title, link, location, image, summary, summary_html, free }
    }),
  )

  return { ...info, lectures: lectures.filter(Boolean) }
})
