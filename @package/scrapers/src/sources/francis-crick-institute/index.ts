import { fetchDom, sanitizeHtml } from '../../utility'
import { Lecture } from '../../entities'
import { crawler } from '../../context'

const info = {
  name: 'The Francis Crick Institute',
  website: 'https://www.crick.ac.uk',
  threads: '@thefranciscrickinstitute',
  description:
    'Crick lectures are open to scientists from other institutes and universities in and around London and elsewhere. Attendees require a minimum of graduate-level biological knowledge and the Crick lectures are not suitable for school-aged participants.',
}

const fetch_lectures = async (): Promise<Lecture[]> => {
  const dom = await fetchDom(`${info.website}/whats-on/seminars-lectures-and-symposia/crick-lectures`)
  const links = Array.from(dom.document.querySelectorAll('.views-element-container article a'))

  const lectures = await Promise.all(
    links
      .map(async (x): Promise<Lecture> => {
        const link = `${info.website}${(x as any).href}`
        const dom = await fetchDom(link)
        const title = dom.document.querySelector('main h1')?.textContent?.trim()!

        const inf = dom.document.querySelector('.c-event-info__list')?.textContent ?? ''
        const [, location] = /Event\sLocation:\s{0,}(.*)?\n/gm.exec(inf.trim()) ?? []
        const [, start] = /Start\stime:\s{0,}(.*)?\n/gm.exec(inf.trim()) ?? []
        const [, end] = /End\stime:[\s-]{0,}(.*)?\n/gm.exec(inf.trim()) ?? []
        const [, date] = /Event\sdate:\s{0,}(.*)?\n/gm.exec(inf.trim()) ?? []
        const time_start = new Date(`${date} ${start}`).toISOString()
        const time_end = new Date(`${date} ${end}`).toISOString()

        const paragraphs = Array.from(dom.document.querySelectorAll('.o-container > div p'))
        const summary = paragraphs.map((x) => x.textContent).join('\n')
        const summary_html = sanitizeHtml(
          paragraphs
            .filter((x) => x.textContent?.trim())
            .map((x) => x.outerHTML)
            .join('\n'),
        )
        const image_src = dom.document.querySelector('main header img')?.getAttribute('src')
        const image = image_src ? { src: `${info.website}${image_src}` } : undefined
        return { free: true, link, title, location, image, time_start, time_end, summary, summary_html }
      })
      .filter(Boolean),
  )

  return lectures
}

export const run = crawler(async () => {
  const lectures = await fetch_lectures()

  return { ...info, lectures }
})
