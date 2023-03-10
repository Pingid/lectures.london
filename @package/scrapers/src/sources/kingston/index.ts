import * as s from '@package/shears'

import { sanitize, sanitizeText } from '../../utility'
import { crawler } from '../../context'
import { Lecture } from '../../entities'

const info = {
  name: 'Kingston University',
  website: 'https://www.kingston.ac.uk/',
  twitter: '@KingstonUni',
}

const url = (query: string = '') => `https://www.kingston.ac.uk/events/all-events/category/124-public-lectures/${query}`

const lecture = s.query({
  link: s.map(s.query('a@href'), (x) => (x ? `https://www.kingston.ac.uk${x}` : undefined)),
  title: 'h3',
  time_start: '[itemprop="startDate"]@datetime',
  location: '[itemprop="location"]',
  summary: s.map(s.query('[itemprop="description"]', s.html), sanitizeText),
  summary_html: s.map(s.query('[itemprop="description"]', s.html), sanitize),
  booking_link: '#middle-col .read-more-link a@href',
  image: s.map(s.query('img@src'), (x) => {
    if (!x) return undefined
    return { src: x }
  }),
})

const getLectures = (query?: string): Promise<Partial<Lecture>[]> => {
  return s
    .goto(
      url(query),
      s.query({
        items: s.query(['.event-item'], lecture),
        next: '.pagination-nav-button:last-child a@href',
      }),
    )()
    .then((x) => {
      const items = x.items.filter(Boolean)
      if (x.next) return getLectures(x.next).then((y) => [...items, ...y])
      return items
    })
}

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(async () => {
  const lectures = await getLectures()
  const host = await getHost()
  console.log(lectures)
  return { ...host, lectures: lectures.map((y) => ({ ...y, free: true })) }
})
