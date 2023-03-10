import * as s from '@package/shears'

import { isUrl, parseStartEnd, sanitize, sanitizeText } from '../../utility'
import { crawler } from '../../context'
import { Lecture } from '../../entities'

const info = {
  name: 'Kings College',
  website: 'https://www.kcl.ac.uk',
  twitter: '@KingsCollegeLon',
}

const url = (page: number = 1) => `https://www.kcl.ac.uk/events/events-calendar?type=lecture&page=${page}`

const lecture = s.query({
  link: s.map(s.query('a@href'), (x) => (x ? `https://www.kcl.ac.uk${x}` : undefined)),
  title: s.map(s.query('h3'), (x) => x?.trim()),
  time: s.map(s.query('a > div:nth-child(2) > p:nth-child(2)'), (y) => (y ? parseStartEnd(y) : undefined)),
  page: s.goto(
    'a@href',
    s.query({
      image: s.map(s.query('.block--event-story__image img@src'), (y) => {
        if (!y) return undefined
        return { src: `https://www.kcl.ac.uk${y}` }
      }),
      summmary: s.map(s.query('.block--article__content', s.html), sanitizeText),
      summmary_html: s.map(s.query('.block--article__content', s.html), sanitize),
      booking_link: s.map(s.query('.block--location__details > a@href'), (x) => (isUrl(x) ? x : undefined)),
    }),
  ),
})

const getLectures = (page: number = 1, max = 0): Promise<Partial<Lecture>[]> =>
  s
    .goto(url(page), s.query(['article'], lecture))()
    .then((x) => x.map((y) => ({ ...y, ...y?.time, ...y?.page, free: true })))
    .then((x) => {
      if (x.length > 0 && max > 0) return getLectures(page + 1, max - 1).then((y) => [...x, ...y])
      return x
    })

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(async () => {
  const lectures = await getLectures(1, 3)
  const host = await getHost()
  return { ...host, lectures }
})
