import * as s from '@package/shears'

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
  time_start: 'h4 time:nth-child(1)@datetime',
  location: '[itemprop="location"]',
  summary: '[itemprop="description"]',
  summary_html: s.query('[itemprop="description"]', s.html),
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
  return { ...host, lectures: lectures.map((y) => ({ ...y, free: true })) }
})
