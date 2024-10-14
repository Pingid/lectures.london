import { fetchDom, parseStartEnd } from '../../utility'
import { Host, Lecture } from '../../entities'
import { crawler } from '../../context'

const info: Omit<Host, 'lectures'> = {
  name: 'The Royal Academy of Arts',
  website: 'https://www.royalacademy.org.uk',
  description: `The Royal Academy of Arts, located in the heart of London, is a place where art is made, exhibited and debated.`,
  twitter: '@royalacademy',
}

export const run = crawler(async () => {
  const dom = await fetchDom(
    `${info.website}/exhibitions-and-events?page=1&what-filter=talks-lectures&who-filter=general`,
  )

  const events = Array.from(dom.document.querySelectorAll('.whats-on li'))
  const lectures = await Promise.all(
    events.map(async (event): Promise<Lecture | null> => {
      const href = event.querySelector('a')!.href
      const link = `${info.website}/${href}`
      const page = await fetchDom(link)
      const free = !!page.document
        .querySelector('.exhibition-hero__tickets__price')
        ?.textContent?.trim()
        .includes('Free')

      if (!free) return null

      const title = page.document.querySelector('.exhibition-hero__promo__title')?.textContent?.trim()!
      const date = page.document.querySelector('.exhibition-hero__promo__date')?.textContent?.trim()!
      //   const summary = page.document.querySelector('.exhibition-hero__promo__description')?.textContent?.trim()!
      const times = parseStartEnd(date)

      if (/open\s{1,}day/gim.test(title)) return null

      return { ...times, title, link, free }
    }),
  )

  return { ...info, lectures: lectures.filter(Boolean) }
})
